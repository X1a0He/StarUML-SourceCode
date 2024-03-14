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

const {Element} = app.type

// Create wireframe function ..............................................

function diagramFn (parent, options) {
  var model, diagram
  parent = parent || app.project.getProject()
  if (parent instanceof type.WFWireframe) {
    diagram = new type.WFWireframeDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else {
    model = new type.WFWireframe()
    model.name = Element.getNewName(parent.ownedElements, 'Wireframe')
    model._parent = parent
    diagram = new type.WFWireframeDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
    model.ownedElements.push(diagram)
    diagram._parent = model
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', model)
  }
  if (diagram) {
    diagram = app.repository.get(diagram._id)
  }
  options.factory.triggerDiagramCreated(diagram)
  return diagram
}

function _modelFn (parent, field, options) {
  return app.factory.defaultModelFn(parent, field, options)
}

function _modelAndViewFn (parent, diagram, options) {
  return app.factory.defaultModelAndViewFn(parent, diagram, options)
}

function _viewOnDiagramFn (model, diagram, options) {
  return app.factory.defaultViewOnDiagramFn(model, diagram, options)
}

// Create Diagram ..........................................................

app.factory.registerDiagramFn('WFWireframeDiagram', diagramFn)

// Create Model ............................................................

app.factory.registerModelFn('WFWireframe', _modelFn)

// Create Model And View ...................................................

app.factory.registerModelAndViewFn('WFFrame', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFMobileFrame', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFWebFrame', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFDesktopFrame', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFButton', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFText', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFRadio', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFCheckbox', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFSwitch', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFLink', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFTabList', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFTab', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFInput', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFDropdown', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFPanel', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFImage', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFSeparator', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFAvatar', _modelAndViewFn)
app.factory.registerModelAndViewFn('WFSlider', _modelAndViewFn)

// Create View .............................................................

app.factory.registerViewOfFn('WFWireframeDiagram', _viewOnDiagramFn)
