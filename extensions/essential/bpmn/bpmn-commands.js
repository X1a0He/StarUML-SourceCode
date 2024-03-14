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

const path = require("path");
const { ipcRenderer } = require("electron");

const { EdgeView } = app.type;

/**
 * New from template
 * @param {string} filename
 */
function handleNewFromTemplate(filename) {
  const fullPath = path.join(__dirname, filename);
  ipcRenderer.send("command", "application:new-from-template", fullPath);
}

/**
 * Add a port
 */
function handleAddBoundaryEvent(options) {
  const view = options.view;
  const diagram = app.diagrams.getCurrentDiagram();
  const _x = view.left + Math.round(Math.random() * view.width);
  const _y = view.top + Math.round(Math.random() * view.height);
  const options1 = {
    id: "BPMNBoundaryEvent",
    diagram: diagram,
    parent: view.model,
    x1: _x,
    y1: _y,
    x2: _x,
    y2: _y,
    containerView: view,
  };
  return app.factory.createModelAndView(options1);
}

/**
 * Add a lane
 */
function handleAddLane(options) {
  const view = options.view;
  const diagram = app.diagrams.getCurrentDiagram();
  const _x = view.left;
  const _y = view.getBottom();
  const options1 = {
    id: "BPMNLane",
    diagram: diagram,
    parent: view.model,
    x1: _x,
    y1: _y,
    x2: _x,
    y2: _y,
    containerView: view,
  };
  return app.factory.createModelAndView(options1);
}

/**
 * Add an event definition
 */
function handleAddEventDefinition(options) {
  const view = options.view;
  const options1 = {
    // id: 'BPMNEventDefinition',
    parent: view.model,
    field: "eventDefinitions",
    ...options,
  };
  return app.factory.createModel(options1);
}

/**
 * Create a participant to choreography
 */
function handleCreateChoreographyParticipant(options) {
  const view = options.view;
  const field = options.field;
  const parent = view.model._parent;
  const builder = app.repository.getOperationBuilder();
  builder.begin("add participant");
  var model = new type.BPMNParticipant();
  model._parent = parent;
  model.name = "Participant";
  builder.insert(model);
  builder.fieldInsert(parent, "ownedElements", model);
  builder.fieldInsert(view.model, field, model);
  builder.end();
  var cmd = builder.getOperation();
  app.repository.doOperation(cmd);
}

/**
 * Assign a participant to choreography
 */
function handleAssignChoreographyParticipant(options) {
  const view = options.view;
  const field = options.field;
  if (view.model instanceof type.BPMNChoreographyActivity) {
    app.elementPickerDialog
      .showDialog("Assign a participant", null, type.BPMNParticipant)
      .then(function ({ buttonId, returnValue }) {
        if (buttonId === "ok") {
          app.engine.addItem(view.model, field, returnValue);
        }
      });
  }
}

/**
 * Assign a initiating participant to choreography
 */
function handleAssignChoreographyInitiatingParticipant(options) {
  const view = options.view;
  if (view.model instanceof type.BPMNChoreographyActivity) {
    app.elementPickerDialog
      .showDialog("Assign initiating participant", null, type.BPMNParticipant)
      .then(function ({ buttonId, returnValue }) {
        if (buttonId === "ok") {
          app.engine.setProperty(
            view.model,
            "initiatingParticipant",
            returnValue,
          );
        }
      });
  }
}

/**
 * Add an initiaing message to choreography
 */
function handleAddChoreographyInitiatingMessage(options) {
  const diagram = app.diagrams.getCurrentDiagram();
  const diagramOwner = diagram._parent;
  const nodes = app.quickedits.getTailNodes(
    options.view,
    type.BPMNMessageLinkView,
  );
  const options1 = Object.assign(
    {
      id: "BPMNMessage",
      diagram: diagram,
      parent: diagramOwner,
    },
    app.quickedits.getTopPosition(options.view.getBoundingBox(), nodes),
  );
  const nodeView = app.factory.createModelAndView(options1);
  const options2 = Object.assign(
    {
      id: "BPMNMessageLink",
      diagram: diagram,
      parent: nodeView.model,
      viewInitializer: (view) => {
        view.lineStyle = EdgeView.LS_RECTILINEAR;
      },
    },
    app.quickedits.getEdgeViewOption(nodeView, options.view),
  );
  return app.factory.createModelAndView(options2);
}

/**
 * Add a return message to choreography
 */
function handleAddChoreographyReturnMessage(options) {
  const diagram = app.diagrams.getCurrentDiagram();
  const diagramOwner = diagram._parent;
  const nodes = app.quickedits.getTailNodes(
    options.view,
    type.BPMNMessageLinkView,
  );
  const options1 = Object.assign(
    {
      id: "BPMNMessage",
      diagram: diagram,
      parent: diagramOwner,
      viewInitializer: (view) => {
        view.fillColor = "#c6c6c6";
      },
    },
    app.quickedits.getBottomPosition(options.view.getBoundingBox(), nodes),
  );
  const nodeView = app.factory.createModelAndView(options1);
  const options2 = Object.assign(
    {
      id: "BPMNMessageLink",
      diagram: diagram,
      parent: nodeView.model,
      viewInitializer: (view) => {
        view.lineStyle = EdgeView.LS_RECTILINEAR;
      },
    },
    app.quickedits.getEdgeViewOption(nodeView, options.view),
  );
  return app.factory.createModelAndView(options2);
}

/**
 * Add text annotation
 */
function handleAddTextAnnotation(options) {
  const diagram = app.diagrams.getCurrentDiagram();
  const diagramOwner = diagram._parent;
  const nodes = app.quickedits.getTailNodes(
    options.view,
    type.BPMNAssociationView,
  );
  const options1 = Object.assign(
    {
      id: "BPMNTextAnnotation",
      diagram: diagram,
      parent: diagramOwner,
      modelInitializer: (model) => {
        model.text = "Text annotation";
      },
    },
    app.quickedits.getBottomPosition(options.view.getBoundingBox(), nodes),
  );
  const nodeView = app.factory.createModelAndView(options1);
  const options2 = Object.assign(
    {
      id: "BPMNAssociation",
      diagram: diagram,
      parent: nodeView.model,
    },
    app.quickedits.getEdgeViewOption(nodeView, options.view),
  );
  return app.factory.createModelAndView(options2);
}

function updateMenus() {
  // var views = app.selections.getSelectedViews()
  var selected = app.selections.getSelected();
  var isNone = !selected;
  var isDiagram = selected instanceof type.Diagram;
  var isProject = selected instanceof type.Project;
  var isExtensibleModel = selected instanceof type.ExtensibleModel;
  var isBPMNProcess =
    selected instanceof type.BPMNProcess ||
    selected instanceof type.BPMNSubProcess;
  var isBPMNEvent = selected instanceof type.BPMNEvent;
  var isBPMNElement = selected instanceof type.BPMNBaseElement;

  let visibleStates = {
    "bpmn.diagram":
      (isNone || isProject || isExtensibleModel || isBPMNProcess) && !isDiagram,
    "bpmn.process": (isProject || isExtensibleModel) && !isBPMNElement,
    "bpmn.collaboration": isBPMNElement,
    "bpmn.choreography": isBPMNElement,
    "bpmn.global-conversation": isBPMNElement,
    "bpmn.task": isBPMNElement,
    "bpmn.subprocess": isBPMNElement,
    "bpmn.gateway": isBPMNElement,
    "bpmn.start-event": isBPMNProcess,
    "bpmn.intermediate-throw-event": isBPMNProcess,
    "bpmn.intermediate-catch-event": isBPMNProcess,
    "bpmn.end-event": isBPMNProcess,
    "bpmn.compensate-event-definition": isBPMNEvent,
    "bpmn.cancel-event-definition": isBPMNEvent,
    "bpmn.error-event-definition": isBPMNEvent,
    "bpmn.link-event-definition": isBPMNEvent,
    "bpmn.signal-event-definition": isBPMNEvent,
    "bpmn.timer-event-definition": isBPMNEvent,
    "bpmn.escalation-event-definition": isBPMNEvent,
    "bpmn.message-event-definition": isBPMNEvent,
    "bpmn.terminate-event-definition": isBPMNEvent,
    "bpmn.conditional-event-definition": isBPMNEvent,
  };
  app.menu.updateStates(visibleStates, null, null);
}

app.commands.register("bpmn:new-from-template", handleNewFromTemplate);
app.commands.register("bpmn:add-lane", handleAddLane);
app.commands.register("bpmn:add-boundary-event", handleAddBoundaryEvent);
app.commands.register("bpmn:add-event-definition", handleAddEventDefinition);
app.commands.register(
  "bpmn:create-choreography-participant",
  handleCreateChoreographyParticipant,
);
app.commands.register(
  "bpmn:assign-choreography-participant",
  handleAssignChoreographyParticipant,
);
app.commands.register(
  "bpmn:assign-choreography-initiating-participant",
  handleAssignChoreographyInitiatingParticipant,
);
app.commands.register(
  "bpmn:add-choreography-initiating-message",
  handleAddChoreographyInitiatingMessage,
);
app.commands.register(
  "bpmn:add-choreography-return-message",
  handleAddChoreographyReturnMessage,
);
app.commands.register("bpmn:add-text-annotation", handleAddTextAnnotation);

// Update Commands
app.on("focus", updateMenus);
app.selections.on("selectionChanged", updateMenus);
app.repository.on("operationExecuted", updateMenus);
