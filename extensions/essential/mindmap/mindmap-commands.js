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

const {EdgeView} = app.type

/**
 * Add a node to left
 */
function handleAddNodeLeft (options) {
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(options.view, type.MMEdgeView)
  const options1 = Object.assign({
    id: 'MMNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getLeftPosition(options.view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'MMEdge',
    diagram: diagram,
    parent: nodeView.model,
    viewInitializer: (view) => {
      view.lineStyle = EdgeView.LS_OBLIQUE
    }
  }, app.quickedits.getEdgeViewOption(nodeView, options.view))
  return app.factory.createModelAndView(options2)
}

/**
 * Add a node to right
 */
function handleAddNodeRight (options) {
  const diagram = app.diagrams.getCurrentDiagram()
  const diagramOwner = diagram._parent
  const nodes = app.quickedits.getTailNodes(options.view, type.MMEdgeView)
  const options1 = Object.assign({
    id: 'MMNode',
    diagram: diagram,
    parent: diagramOwner
  }, app.quickedits.getRightPosition(options.view.getBoundingBox(), nodes))
  const nodeView = app.factory.createModelAndView(options1)
  const options2 = Object.assign({
    id: 'MMEdge',
    diagram: diagram,
    parent: nodeView.model,
    viewInitializer: (view) => {
      view.lineStyle = EdgeView.LS_OBLIQUE
    }
  }, app.quickedits.getEdgeViewOption(nodeView, options.view))
  return app.factory.createModelAndView(options2)
}

function updateMenus () {
  var selected = app.selections.getSelected()
  var isNone = (!selected)
  var isDiagram = selected instanceof type.Diagram
  var isProject = selected instanceof type.Project
  var isExtensibleModel = selected instanceof type.ExtensibleModel

  let visibleStates = {
    'mindmap.diagram': ((isNone || isProject || isExtensibleModel) && !isDiagram),
    'mindmap.mindmap': (isProject || isExtensibleModel)
  }
  app.menu.updateStates(visibleStates, null, null)
}

app.commands.register('mindmap:add-node-left', handleAddNodeLeft)
app.commands.register('mindmap:add-node-right', handleAddNodeRight)

// Update Commands
app.on('focus', updateMenus)
app.selections.on('selectionChanged', updateMenus)
app.repository.on('operationExecuted', updateMenus)
