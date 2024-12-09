/*
 * Copyright (c) 2013-2014 Minkyu Lee. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of Minkyu Lee. The intellectual and technical concepts
 * contained herein are proprietary to Minkyu Lee and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Minkyu Lee (niklaus.lee@gmail.com).
 *
 */

const { EventEmitter } = require("events");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const UnregisteredDialog = require("../dialogs/unregistered-dialog");
const packageJSON = require("../../package.json");

const SK = "DF9B72CC966FBE3A46F99858C5AEE";

// Check License When File Save
const LICENSE_CHECK_PROBABILITY = 0.3;

const PRO_DIAGRAM_TYPES = [
  "SysMLRequirementDiagram",
  "SysMLBlockDefinitionDiagram",
  "SysMLInternalBlockDiagram",
  "SysMLParametricDiagram",
  "BPMNDiagram",
  "WFWireframeDiagram",
  "AWSDiagram",
  "GCPDiagram",
];

var status = false;
var licenseInfo = null;

/**
 * Set Registration Status
 * This function is out of LicenseManager class for the security reason
 * (To disable changing License status by API)
 * @private
 * @param {boolean} newStat
 * @return {string}
 */
function setStatus(licenseManager, newStat) {
  if (status !== newStat) {
    status = newStat;
    licenseManager.emit("statusChanged", status);
  }
}

/**
 * @private
 */
class LicenseManager extends EventEmitter {
  constructor() {
    super();
    this.projectManager = null;
  }

  isProDiagram(diagramType) {
    return PRO_DIAGRAM_TYPES.includes(diagramType);
  }

  /**
   * Get Registration Status
   * @return {string}
   */
  getStatus() {
    return status;
  }

  /**
   * Get License Infomation
   * @return {Object}
   */
  getLicenseInfo() {
    return licenseInfo;
  }

  findLicense() {
    var licensePath = path.join(app.getUserPath(), "/license.key");
    if (!fs.existsSync(licensePath)) {
      licensePath = path.join(app.getAppPath(), "../license.key");
    }
    if (fs.existsSync(licensePath)) {
      return licensePath;
    } else {
      return null;
    }
  }

  /**
   * Check license validity
   *
   * @return {Promise}
   */
  validate() {
    return new Promise((resolve, reject) => {
      try {
        // Local check
        var file = this.findLicense();
        if (!file) {
          reject("License key not found");
        } else {
          var data = fs.readFileSync(file, "utf8");
          licenseInfo = JSON.parse(data);
          if (licenseInfo.product !== packageJSON.config.product_id) {
            app.toast.error(
              `License key is for old version (${licenseInfo.product})`,
            );
            reject(`License key is not for ${packageJSON.config.product_id}`);
          } else {
            var base =
              SK +
              licenseInfo.name +
              SK +
              licenseInfo.product +
              "-" +
              licenseInfo.licenseType +
              SK +
              licenseInfo.quantity +
              SK +
              licenseInfo.timestamp +
              SK;
            var _key = crypto
              .createHash("sha1")
              .update(base)
              .digest("hex")
              .toUpperCase();
            if (_key !== licenseInfo.licenseKey) {
              reject("Invalid license key");
            } else {
              // Server check
              $.ajax({
                type: "POST",
                url: app.config.validation_url,
                data: {
                  licenseKey: licenseInfo.licenseKey,
                },
                timeout: 2000,
              })
                .done((data1) => {
                  resolve(data1);
                })
                .fail((err) => {
                  if (err && err.status === 499) {
                    /* License key not exists */
                    reject(err);
                  } else {
                    // If server is not available, assume that license key is valid
                    resolve(licenseInfo);
                  }
                });
            }
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Return evaluation period status
   * @private
   * @return {number} Remaining days
   */
  checkEvaluationPeriod() {
    const file = path.join(window.app.getUserPath(), "lib.so");
    if (!fs.existsSync(file)) {
      const timestamp = Date.now();
      fs.writeFileSync(file, timestamp.toString());
    }
    try {
      const timestamp = parseInt(fs.readFileSync(file, "utf8"));
      const now = Date.now();
      const remains =
        30 - Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
      return remains;
    } catch (err) {
      console.error(err);
    }
    return -1; // expired
  }

  async checkLicenseValidity() {
    if (packageJSON.config.setappBuild) {
      setStatus(this, true);
    } else {
      try {
        const result = await this.validate();
        setStatus(this, true);
      } catch (err) {
        const remains = this.checkEvaluationPeriod();
        const isExpired = remains < 0;
        const result = await UnregisteredDialog.showDialog(remains);
        setStatus(this, false);
        if (isExpired) {
          app.quit();
        }
      }
    }
  }

  /**
   * Check the license key in server and store it as license.key file in local
   *
   * @param {string} licenseKey
   */
  register(licenseKey) {
    return new Promise((resolve, reject) => {
      $.post(app.config.validation_url, { licenseKey: licenseKey })
        .done((data) => {
          if (data.product === packageJSON.config.product_id) {
            var file = path.join(app.getUserPath(), "/license.key");
            fs.writeFileSync(file, JSON.stringify(data, 2));
            licenseInfo = data;
            setStatus(this, true);
            resolve(data);
          } else {
            setStatus(this, false);
            reject("unmatched"); /* License is for old version */
          }
        })
        .fail((err) => {
          setStatus(this, false);
          if (err.status === 499) {
            /* License key not exists */
            reject("invalid");
          } else {
            reject();
          }
        });
    });
  }

  htmlReady() {}

  appReady() {
    this.checkLicenseValidity();
  }
}

module.exports = LicenseManager;
