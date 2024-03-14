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

const Mustache = require('mustache')
const {Element} = app.type
const ERR_INVALID_LINK = 'Invalid connection ({{.}})'

// Preconditions ...........................................................

function linkPrecondition (options) {
  app.factory.assert(
    (options.tailModel instanceof type.BPMNBaseElement) && (options.headModel instanceof type.BPMNBaseElement),
    Mustache.render(ERR_INVALID_LINK, options.modelType)
  )
}

// Create BPMN diagram functions ...............................................

function diagramFn (parent, options) {
  var model, diagram
  parent = parent || app.project.getProject()
  if (parent instanceof type.BPMNRootElement || parent instanceof type.BPMNActivity) {
    diagram = new type.BPMNDiagram()
    diagram.name = Element.getNewName(parent.ownedElements, diagram.getDisplayClassName())
    if (options.diagramInitializer) {
      options.diagramInitializer(diagram)
    }
    app.engine.addModel(parent, 'ownedElements', diagram)
  } else {
    model = new type.BPMNProcess()
    model.name = Element.getNewName(parent.ownedElements, 'BPMNProcess')
    model._parent = parent
    diagram = new type.BPMNDiagram()
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

function _directedRelationshipFn (parent, diagram, options) {
  return app.factory.defaultDirectedRelationshipFn(options.tailModel, diagram, options)
}

function _viewOnDiagramFn (model, diagram, options) {
  return app.factory.defaultViewOnDiagramFn(model, diagram, options)
}

// Create Diagram ..........................................................

app.factory.registerDiagramFn('BPMNDiagram', diagramFn)

// Create Model ............................................................

app.factory.registerModelFn('BPMNProcess', _modelFn)
app.factory.registerModelFn('BPMNCollaboration', _modelFn)
app.factory.registerModelFn('BPMNChoreography', _modelFn)
app.factory.registerModelFn('BPMNGlobalConversation', _modelFn)
app.factory.registerModelFn('BPMNParticipant', _modelFn)
app.factory.registerModelFn('BPMNStartEvent', _modelFn)
app.factory.registerModelFn('BPMNIntermediateThrowEvent', _modelFn)
app.factory.registerModelFn('BPMNIntermediateCatchEvent', _modelFn)
app.factory.registerModelFn('BPMNBoundaryEvent', _modelFn)
app.factory.registerModelFn('BPMNEndEvent', _modelFn)
app.factory.registerModelFn('BPMNCompensateEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNCancelEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNErrorEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNLinkEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNSignalEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNTimerEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNEscalationEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNMessageEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNTerminateEventDefinition', _modelFn)
app.factory.registerModelFn('BPMNConditionalEventDefinition', _modelFn)

// Create Model And View ...................................................

app.factory.registerModelAndViewFn('BPMNParticipant', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNLane', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNCallActivity', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNTask', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNSendTask', _modelAndViewFn, { modelType: 'BPMNSendTask', viewType: 'BPMNTaskView' })
app.factory.registerModelAndViewFn('BPMNReceiveTask', _modelAndViewFn, { modelType: 'BPMNReceiveTask', viewType: 'BPMNTaskView' })
app.factory.registerModelAndViewFn('BPMNServiceTask', _modelAndViewFn, { modelType: 'BPMNServiceTask', viewType: 'BPMNTaskView' })
app.factory.registerModelAndViewFn('BPMNUserTask', _modelAndViewFn, { modelType: 'BPMNUserTask', viewType: 'BPMNTaskView' })
app.factory.registerModelAndViewFn('BPMNManualTask', _modelAndViewFn, { modelType: 'BPMNManualTask', viewType: 'BPMNTaskView' })
app.factory.registerModelAndViewFn('BPMNBusinessRuleTask', _modelAndViewFn, { modelType: 'BPMNBusinessRuleTask', viewType: 'BPMNTaskView' })
app.factory.registerModelAndViewFn('BPMNScriptTask', _modelAndViewFn, { modelType: 'BPMNScriptTask', viewType: 'BPMNTaskView' })
app.factory.registerModelAndViewFn('BPMNSubProcess', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNAdHocSubProcess', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNTransaction', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNChoreographyTask', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNSubChoreography', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNStartEvent', _modelAndViewFn, { modelType: 'BPMNStartEvent', viewType: 'BPMNEventView' })
app.factory.registerModelAndViewFn('BPMNIntermediateThrowEvent', _modelAndViewFn, { modelType: 'BPMNIntermediateThrowEvent', viewType: 'BPMNEventView' })
app.factory.registerModelAndViewFn('BPMNIntermediateCatchEvent', _modelAndViewFn, { modelType: 'BPMNIntermediateCatchEvent', viewType: 'BPMNEventView' })
app.factory.registerModelAndViewFn('BPMNBoundaryEvent', _modelAndViewFn, { modelType: 'BPMNBoundaryEvent', viewType: 'BPMNEventView' })
app.factory.registerModelAndViewFn('BPMNEndEvent', _modelAndViewFn, { modelType: 'BPMNEndEvent', viewType: 'BPMNEventView' })
app.factory.registerModelAndViewFn('BPMNExclusiveGateway', _modelAndViewFn, { modelType: 'BPMNExclusiveGateway', viewType: 'BPMNGatewayView' })
app.factory.registerModelAndViewFn('BPMNInclusiveGateway', _modelAndViewFn, { modelType: 'BPMNInclusiveGateway', viewType: 'BPMNGatewayView' })
app.factory.registerModelAndViewFn('BPMNComplexGateway', _modelAndViewFn, { modelType: 'BPMNComplexGateway', viewType: 'BPMNGatewayView' })
app.factory.registerModelAndViewFn('BPMNParallelGateway', _modelAndViewFn, { modelType: 'BPMNParallelGateway', viewType: 'BPMNGatewayView' })
app.factory.registerModelAndViewFn('BPMNEventBasedGateway', _modelAndViewFn, { modelType: 'BPMNEventBasedGateway', viewType: 'BPMNGatewayView' })
app.factory.registerModelAndViewFn('BPMNDataObject', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNDataStore', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNDataInput', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNDataOutput', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNMessage', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNConversation', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNSubConversation', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNCallConversation', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNSequenceFlow', _directedRelationshipFn, { precondition: linkPrecondition })
app.factory.registerModelAndViewFn('BPMNMessageFlow', _directedRelationshipFn, { precondition: linkPrecondition })
app.factory.registerModelAndViewFn('BPMNTextAnnotation', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNGroup', _modelAndViewFn)
app.factory.registerModelAndViewFn('BPMNAssociation', _directedRelationshipFn)
app.factory.registerModelAndViewFn('BPMNDataAssociation', _directedRelationshipFn)
app.factory.registerModelAndViewFn('BPMNMessageLink', _directedRelationshipFn)
app.factory.registerModelAndViewFn('BPMNConversationLink', _directedRelationshipFn)

// Create View .............................................................

app.factory.registerViewOfFn('BPMNDiagram', _viewOnDiagramFn)
