/*
 * Copyright (c) 2013-2023 Minkyu Lee. All rights reserved.
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

const path = require('path')
const {ipcRenderer} = require('electron')

/**
 * New from template
 * @param {string} filename
 */
function handleNewFromTemplate (filename) {
  const fullPath = path.join(__dirname, filename)
  ipcRenderer.send('command', 'application:new-from-template', fullPath)
}

/**
 * Add a lane
 */
function handleAddTab (options) {
  const view = options.view
  const diagram = app.diagrams.getCurrentDiagram()
  const _x = view.left
  const _y = view.getBottom()
  const options1 = {
    id: 'WFTab',
    diagram: diagram,
    parent: view.model,
    x1: _x,
    y1: _y,
    x2: _x,
    y2: _y,
    containerView: view
  }
  return app.factory.createModelAndView(options1)
}

function updateMenus () {
  var selected = app.selections.getSelected()
  var isNone = (!selected)
  var isDiagram = selected instanceof type.Diagram
  var isProject = selected instanceof type.Project
  var isExtensibleModel = selected instanceof type.ExtensibleModel

  let visibleStates = {
    'wireframe.diagram': ((isNone || isProject || isExtensibleModel) && !isDiagram),
    'wireframe.wireframe': (isProject || isExtensibleModel)
  }
  app.menu.updateStates(visibleStates, null, null)
}

app.commands.register('wireframe:new-from-template', handleNewFromTemplate)
app.commands.register('wireframe:add-tab', handleAddTab)

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
