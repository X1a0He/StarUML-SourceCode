/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/* eslint-disable no-useless-escape */

/**
 * @private
 * The ExtensionManager fetches/caches the extension registry and provides
 * information about the status of installed extensions. ExtensionManager raises the
 * following events:
 *     statusChange - indicates that an extension has been installed/uninstalled or
 *         its status has otherwise changed. Second parameter is the id of the
 *         extension.
 *     registryUpdate - indicates that an existing extension was synchronized
 *         with new data from the registry.
 */

const fs = require('fs-extra')
const Package = require('./package')
const Async = require('../utils/async')
const Strings = require('../strings')
const StringUtils = require('../utils/string-utils')
const slash = require('slash')

// semver.browser is an AMD-compatible module
const semver = require('semver')

// Extension status constants.
const ENABLED = 'enabled'
const START_FAILED = 'startFailed'

// Extension location constants.
const LOCATION_DEFAULT = 'default'
const LOCATION_DEV = 'dev'
const LOCATION_USER = 'user'
const LOCATION_UNKNOWN = 'unknown'

/**
 * @private
 * @type {Object.<string, {metadata: Object, path: string, status: string}>}
 * The set of all known extensions, both from the registry and locally installed.
 * The keys are either "name" from package.json (for extensions that have package metadata)
 * or the last segment of local file paths (for installed legacy extensions
 * with no package metadata). The fields of each record are:
 *     registryInfo: object containing the info for this id from the main registry (containing metadata, owner,
 *         and versions). This will be null for legacy extensions.
 *     installInfo: object containing the info for a locally-installed extension:
 *         metadata: the package metadata loaded from the local package.json, or null if it's a legacy extension.
 *             This will be different from registryInfo.metadata if there's a newer version in the registry.
 *         path: the local path to the extension folder on disk
 *         locationType: general type of installation; one of the LOCATION_* constants above
 *         status: the current status, one of the status constants above
 */
var extensions = {}

/**
 * @private
 * Requested changes to the installed extensions.
 */
var _idsToRemove = []
var _idsToUpdate = []

/**
 * @private
 * Synchronizes the information between the public registry and the installed
 * extensions. Specifically, this makes the `owner` available in each and sets
 * an `updateAvailable` flag.
 *
 * @param {string} id of the extension to synchronize
 */
function synchronizeEntry (id) {
  var entry = extensions[id]

  // Do nothing if we only have one set of data
  if (!entry || !entry.installInfo || !entry.registryInfo) {
    return
  }

  entry.installInfo.owner = entry.registryInfo.owner
  if (entry.installInfo.metadata && entry.installInfo.metadata.version && semver.lt(entry.installInfo.metadata.version, entry.registryInfo.metadata.version)) {
    // Note: available update may still be incompatible; we check for this when rendering the Update button in ExtensionManagerView._renderItem()
    entry.registryInfo.updateAvailable = true
    entry.installInfo.updateAvailable = true
  } else {
    entry.installInfo.updateAvailable = false
    entry.registryInfo.updateAvailable = false
  }

  $(exports).triggerHandler('registryUpdate', [id])
}

/**
 * @private
 * Sets our data. For unit testing only.
 */
function _setExtensions (newExtensions) {
  exports.extensions = extensions = newExtensions
  Object.keys(extensions).forEach(function (id) {
    synchronizeEntry(id)
  })
}

/**
 * @private
 * Clears out our existing data. For unit testing only.
 */
function _reset () {
  exports.extensions = extensions = {}
  _idsToRemove = []
  _idsToUpdate = []
}

/**
 * @private
 * Downloads the registry of Brackets extensions and stores the information in our
 * extension info.
 *
 * @return {$.Promise} a promise that's resolved with the registry JSON data
 * or rejected if the server can't be reached.
 */
function downloadRegistry () {
  var result = new $.Deferred()
  $.ajax({
    url: app.config.extension_registry,
    data: {
      version: app.version
    },
    dataType: 'json',
    cache: false
  })
  .done(function (data) {
    Object.keys(data).forEach(function (id) {
      if (!extensions[id]) {
        extensions[id] = {}
      }
      extensions[id].registryInfo = data[id]
      synchronizeEntry(id)
    })
    result.resolve()
  })
  .fail(function () {
    result.reject()
  })
  return result.promise()
}

/**
 * @private
 * Loads the package.json file in the given extension folder.
 * @param {string} folder The extension folder.
 * @return {$.Promise} A promise object that is resolved with the parsed contents of the package.json file,
 *     or rejected if there is no package.json or the contents are not valid JSON.
 */
function _loadPackageJson (folder) {
  var result = new $.Deferred()
  fs.readFile(folder + '/package.json', 'utf8', function (err, text) {
    if (err) {
      result.reject()
    } else {
      try {
        var json = JSON.parse(text)
        result.resolve(json)
      } catch (e) {
        result.reject()
      }
    }
  })
  return result.promise()
}

/**
 * @private
 * When an extension is loaded, fetches the package.json and stores the extension in our map.
 * @param {string} path The local path of the loaded extension's folder.
 * @param {boolean} loadSucceed Whether the extension is loaded successfully or not
 */
function _handleExtensionLoad (path, loadSucceed) {
  function setData (id, metadata) {
    var locationType
    var userExtensionPath = app.extensionLoader.getUserExtensionPath()
    if (path.indexOf(userExtensionPath) === 0) {
      locationType = LOCATION_USER
    } else {
      path = slash(path)
      var segments = path.split('/')
      var parent
      if (segments.length > 2) {
        parent = segments[segments.length - 2]
      }
      if (parent === 'dev') {
        locationType = LOCATION_DEV
      } else if (parent === 'default' || parent === 'essential') {
        locationType = LOCATION_DEFAULT
      } else {
        locationType = LOCATION_UNKNOWN
      }
    }
    if (!extensions[id]) {
      extensions[id] = {}
    }
    extensions[id].installInfo = {
      metadata: metadata,
      path: path,
      locationType: locationType,
      status: (!loadSucceed ? START_FAILED : ENABLED)
    }
    synchronizeEntry(id)
    $(exports).triggerHandler('statusChange', [id])
  }

  _loadPackageJson(path)
    .done(function (metadata) {
      setData(metadata.name, metadata)
    })
    .fail(function () {
      // If there's no package.json, this is a legacy extension. It was successfully loaded,
      // but we don't have an official ID or metadata for it, so we just create an id and
      // "title" for it (which is the last segment of its pathname)
      // and record that it's enabled.
      var match = path.match(/\/([^\/]+)$/)
      var name = (match && match[1]) || path
      var metadata = { name: name, title: name }
      setData(name, metadata)
    })
}

/**
 * @private
 * Determines if the given versions[] entry is compatible with the given Brackets API version, and if not
 * specifies why.
 * @param {Object} extVersion
 * @param {string} apiVersion
 * @return {{isCompatible: boolean, requiresNewer: ?boolean, compatibleVersion: ?string}}
 */
function getCompatibilityInfoForVersion (extVersion, apiVersion) {
  var requiredVersion = (extVersion.staruml || (extVersion.engines && extVersion.engines.staruml))
  var result = {}
  result.isCompatible = !requiredVersion || semver.satisfies(apiVersion, requiredVersion)
  if (result.isCompatible) {
    result.compatibleVersion = extVersion.version
  } else {
    // Find out reason for incompatibility
    if (requiredVersion.charAt(0) === '<') {
      result.requiresNewer = false
    } else if (requiredVersion.charAt(0) === '>') {
      result.requiresNewer = true
    } else if (requiredVersion.charAt(0) === '~') {
      var compareVersion = requiredVersion.slice(1)
      // Need to add .0s to this style of range in order to compare (since valid version
      // numbers must have major/minor/patch).
      if (compareVersion.match(/^[0-9]+$/)) {
        compareVersion += '.0.0'
      } else if (compareVersion.match(/^[0-9]+\.[0-9]+$/)) {
        compareVersion += '.0'
      }
      result.requiresNewer = semver.lt(apiVersion, compareVersion)
    }
  }
  return result
}

/**
 * @private
 * Finds the newest version of the entry that is compatible with the given Brackets API version, if any.
 * @param {Object} entry The registry entry to check.
 * @param {string} apiVersion The Brackets API version to check against.
 * @return {{isCompatible: boolean, requiresNewer: ?boolean, compatibleVersion: ?string, isLatestVersion: boolean}}
 *      Result contains an "isCompatible" member saying whether it's compatible. If compatible, "compatibleVersion"
 *      specifies the newest version that is compatible and "isLatestVersion" indicates if this is the absolute
 *      latest version of the extension or not. If !isCompatible or !isLatestVersion, "requiresNewer" says whether
 *      the latest version is incompatible due to requiring a newer (vs. older) version of Brackets.
 */
function getCompatibilityInfo (entry, apiVersion) {
  if (!entry.versions) {
    var fallback = getCompatibilityInfoForVersion(entry.metadata, apiVersion)
    if (fallback.isCompatible) {
      fallback.isLatestVersion = true
    }
    return fallback
  }

  var i = entry.versions.length - 1
  var latestInfo = getCompatibilityInfoForVersion(entry.versions[i], apiVersion)

  if (latestInfo.isCompatible) {
    latestInfo.isLatestVersion = true
    return latestInfo
  } else {
    // Look at earlier versions (skipping very latest version since we already checked it)
    for (i--; i >= 0; i--) {
      var compatInfo = getCompatibilityInfoForVersion(entry.versions[i], apiVersion)
      if (compatInfo.isCompatible) {
        compatInfo.isLatestVersion = false
        compatInfo.requiresNewer = latestInfo.requiresNewer
        return compatInfo
      }
    }

    // No version is compatible, so just return info for the latest version
    return latestInfo
  }
}

/**
 * @private
 * Given an extension id and version number, returns the URL for downloading that extension from
 * the repository. Does not guarantee that the extension exists at that URL.
 * @param {string} id The extension's name from the metadata.
 * @param {string} version The version to download.
 * @return {string} The URL to download the extension from.
 */
function getExtensionURL (id, version) {
  return StringUtils.format(app.config.extension_url, id, version)
}

/**
 * @private
 * Removes the installed extension with the given id.
 * @param {string} id The id of the extension to remove.
 * @return {$.Promise} A promise that's resolved when the extension is removed or
 *     rejected with an error if there's a problem with the removal.
 */
function remove (id) {
  var result = new $.Deferred()
  if (extensions[id] && extensions[id].installInfo) {
    Package.remove(extensions[id].installInfo.path)
      .done(function () {
        extensions[id].installInfo = null
        result.resolve()
        $(exports).triggerHandler('statusChange', [id])
      })
      .fail(function (err) {
        result.reject(err)
      })
  } else {
    result.reject(StringUtils.format(Strings.EXTENSION_NOT_INSTALLED, id))
  }
  return result.promise()
}

/**
 * @private
 * Updates an installed extension with the given package file.
 * @param {string} id of the extension
 * @param {string} packagePath path to the package file
 * @return {$.Promise} A promise that's resolved when the extension is updated or
 *     rejected with an error if there's a problem with the update.
 */
function update (id, packagePath) {
  return Package.installUpdate(packagePath, id)
}

/**
 * @private
 * Deletes any temporary files left behind by extensions that
 * were marked for update.
 */
function cleanupUpdates () {
  Object.keys(_idsToUpdate).forEach(function (id) {
    var filename = _idsToUpdate[id].localPath
    if (filename) {
      fs.unlink(filename)
    }
  })
  _idsToUpdate = {}
}

/**
 * @private
 * Unmarks all extensions marked for removal.
 */
function unmarkAllForRemoval () {
  _idsToRemove = {}
}

/**
 * @private
 * Marks an extension for later removal, or unmarks an extension previously marked.
 * @param {string} id The id of the extension to mark for removal.
 * @param {boolean} mark Whether to mark or unmark it.
 */
function markForRemoval (id, mark) {
  if (mark) {
    _idsToRemove[id] = true
  } else {
    delete _idsToRemove[id]
  }
  $(exports).triggerHandler('statusChange', [id])
}

/**
 * @private
 * Returns true if an extension is marked for removal.
 * @param {string} id The id of the extension to check.
 * @return {boolean} true if it's been marked for removal, false otherwise.
 */
function isMarkedForRemoval (id) {
  return !!(_idsToRemove[id])
}

/**
 * @private
 * Returns true if there are any extensions marked for removal.
 * @return {boolean} true if there are extensions to remove
 */
function hasExtensionsToRemove () {
  return Object.keys(_idsToRemove).length > 0
}

/**
 * @private
 * If a downloaded package appears to be an update, mark the extension for update.
 * If an extension was previously marked for removal, marking for update will
 * turn off the removal mark.
 * @param {Object} installationResult info about the install provided by the Package.download function
 */
function updateFromDownload (installationResult) {
  var installationStatus = installationResult.installationStatus
  if (installationStatus === Package.InstallationStatuses.ALREADY_INSTALLED ||
    installationStatus === Package.InstallationStatuses.NEEDS_UPDATE ||
    installationStatus === Package.InstallationStatuses.SAME_VERSION ||
    installationStatus === Package.InstallationStatuses.OLDER_VERSION) {
    var id = installationResult.name
    delete _idsToRemove[id]
    _idsToUpdate[id] = installationResult
    $(exports).triggerHandler('statusChange', [id])
  }
}

/**
 * @private
 * Removes the mark for an extension to be updated on restart. Also deletes the
 * downloaded package file.
 * @param {string} id The id of the extension for which the update is being removed
 */
function removeUpdate (id) {
  var installationResult = _idsToUpdate[id]
  if (!installationResult) {
    return
  }
  if (installationResult.localPath) {
    fs.unlink(installationResult.localPath)
  }
  delete _idsToUpdate[id]
  $(exports).triggerHandler('statusChange', [id])
}

/**
 * @private
 * Returns true if an extension is marked for update.
 * @param {string} id The id of the extension to check.
 * @return {boolean} true if it's been marked for update, false otherwise.
 */
function isMarkedForUpdate (id) {
  return !!(_idsToUpdate[id])
}

/**
 * @private
 * Returns true if there are any extensions marked for update.
 * @return {boolean} true if there are extensions to update
 */
function hasExtensionsToUpdate () {
  return Object.keys(_idsToUpdate).length > 0
}

/**
 * @private
 * Removes extensions previously marked for removal.
 * @return {$.Promise} A promise that's resolved when all extensions are removed, or rejected
 *     if one or more extensions can't be removed. When rejected, the argument will be an
 *     array of error objects, each of which contains an "item" property with the id of the
 *     failed extension and an "error" property with the actual error.
 */
function removeMarkedExtensions () {
  return Async.doInParallelAggregateErrors(
    Object.keys(_idsToRemove),
    function (id) {
      return remove(id)
    }
  )
}

/**
 * @private
 * Updates extensions previously marked for update.
 * @return {$.Promise} A promise that's resolved when all extensions are updated, or rejected
 *     if one or more extensions can't be updated. When rejected, the argument will be an
 *     array of error objects, each of which contains an "item" property with the id of the
 *     failed extension and an "error" property with the actual error.
 */
function updateExtensions () {
  return Async.doInParallelAggregateErrors(
    Object.keys(_idsToUpdate),
    function (id) {
      var installationResult = _idsToUpdate[id]
      return update(installationResult.name, installationResult.localPath)
    }
  )
}

function htmlReady () {
  // Listen to extension load and loadFailed events
  app.extensionLoader.on('load', _handleExtensionLoad)
  app.extensionLoader.on('loadFailed', _handleExtensionLoad)
}

// Public exports
exports.downloadRegistry = downloadRegistry
exports.getCompatibilityInfo = getCompatibilityInfo
exports.getExtensionURL = getExtensionURL
exports.remove = remove
exports.update = update
exports.extensions = extensions
exports.cleanupUpdates = cleanupUpdates
exports.markForRemoval = markForRemoval
exports.isMarkedForRemoval = isMarkedForRemoval
exports.unmarkAllForRemoval = unmarkAllForRemoval
exports.hasExtensionsToRemove = hasExtensionsToRemove
exports.updateFromDownload = updateFromDownload
exports.removeUpdate = removeUpdate
exports.isMarkedForUpdate = isMarkedForUpdate
exports.hasExtensionsToUpdate = hasExtensionsToUpdate
exports.removeMarkedExtensions = removeMarkedExtensions
exports.updateExtensions = updateExtensions

exports.ENABLED = ENABLED
exports.START_FAILED = START_FAILED

exports.LOCATION_DEFAULT = LOCATION_DEFAULT
exports.LOCATION_DEV = LOCATION_DEV
exports.LOCATION_USER = LOCATION_USER
exports.LOCATION_UNKNOWN = LOCATION_UNKNOWN

// For unit testing only
exports._reset = _reset
exports._setExtensions = _setExtensions
exports.htmlReady = htmlReady
