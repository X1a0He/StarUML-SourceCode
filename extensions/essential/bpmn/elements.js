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

const {
  Point,
  Color,
  Coord,
  Rect,
  ExtensibleModel,
  DirectedRelationship,
  Diagram,
  View,
  NodeView,
  EdgeView,
  EdgeParasiticView,
  NodeLabelView,
  EdgeLabelView,
  LabelView,
  Canvas,
} = app.type;

const SHADOW_OFFSET = 7;
const SHADOW_ALPHA = 0.2;
const SHADOW_COLOR = Color.LIGHT_GRAY;

const LEFT_PADDING = 5;
const RIGHT_PADDING = 5;
const TOP_PADDING = 5;
const BOTTOM_PADDING = 5;

const ACTIVITY_ROUND = 10;

const EVENT_MINWIDTH = 32;
const EVENT_MINHEIGHT = 32;
const MESSAGE_MINWIDTH = 32;
const MESSAGE_MINHEIGHT = 24;
const GATEWAY_MINWIDTH = 32;
const GATEWAY_MINHEIGHT = 32;
const DATAOBJECT_MINWIDTH = 32;
const DATAOBJECT_MINHEIGHT = 40;
const TEXTANNOTATION_MINWIDTH = 10;
const TEXTANNOTATION_MINHEIGHT = 10;
const CONVERSATION_MINWIDTH = 38;
const CONVERSATION_MINHEIGHT = 32;

const COMPARTMENT_LEFT_PADDING = 5;
const COMPARTMENT_RIGHT_PADDING = 5;
const COMPARTMENT_TOP_PADDING = 5;
const COMPARTMENT_BOTTOM_PADDING = 5;

/**
 * BPMNDiagram
 */
class BPMNDiagram extends Diagram {
  canAcceptModel(model) {
    return (
      model instanceof type.Hyperlink ||
      model instanceof type.Diagram ||
      model instanceof type.BPMNParticipant ||
      model instanceof type.BPMNLane ||
      model instanceof type.BPMNActivity ||
      model instanceof type.BPMNEvent ||
      model instanceof type.BPMNGateway ||
      model instanceof type.BPMNSequenceFlow ||
      model instanceof type.BPMNMessage ||
      model instanceof type.BPMNMessageFlow
    );
  }
}

/**
 * BPMNBaseElement
 */
class BPMNBaseElement extends ExtensibleModel {
  constructor() {
    super();

    /** @member {string} */
    this.id = "";
  }

  getDisplayClassName() {
    return this.getClassName();
  }
}

/**
 * BPMNRootElement
 */
class BPMNRootElement extends BPMNBaseElement {}

/**
 * BPMNCollaboration
 */
class BPMNCollaboration extends BPMNRootElement {}

/**
 * BPMNChoreography
 */
class BPMNChoreography extends BPMNCollaboration {}

/**
 * BPMNGlobalConversation
 */
class BPMNGlobalConversation extends BPMNCollaboration {}

/**
 * BPMNParticipant
 */
class BPMNParticipant extends BPMNBaseElement {
  constructor() {
    super();

    /** @member {number} */
    this.minimum = 0;

    /** @member {number} */
    this.maximum = 1;
  }

  canContain(elem) {
    return (
      elem instanceof BPMNLane ||
      elem instanceof BPMNFlowElement ||
      elem instanceof BPMNItemAwareElement
    );
  }
}

/**
 * BPMNLane
 */
class BPMNLane extends BPMNBaseElement {
  canContain(elem) {
    return (
      elem instanceof BPMNFlowElement || elem instanceof BPMNItemAwareElement
    );
  }
}

/**
 * BPMNProcess
 */
class BPMNProcess extends BPMNRootElement {
  constructor() {
    super();

    /** @member {string} */
    this.processType = BPMNProcess.PT_NONE;

    /** @member {boolean} */
    this.isClosed = false;

    /** @member {boolean} */
    this.isExecutable = false;
  }
}

/**
 * @const {string}
 */
BPMNProcess.PT_NONE = "none";

/**
 * @const {string}
 */
BPMNProcess.PT_PUBLIC = "public";

/**
 * @const {string}
 */
BPMNProcess.PT_PRIVATE = "private";

/**
 * BPMNFlowElement
 */
class BPMNFlowElement extends BPMNBaseElement {}

/* ------------------------------- ACTIVITIES ------------------------------- */

/**
 * BPMNActivity
 */
class BPMNActivity extends BPMNFlowElement {
  constructor() {
    super();

    /** @member {boolean} */
    this.isForCompensation = false;

    /** @member {number} */
    this.startQuantity = 0;

    /** @member {number} */
    this.completionQuantity = 0;

    /** @member {boolean} */
    this.isMultiInstance = false;

    /** @member {BPMNMultiInstanceBehavior} */
    this.multiInstanceBehavior = BPMNActivity.MIB_NONE;

    /** @member {boolean} */
    this.isLoop = false;

    /** @member {boolean} */
    this.isSequential = false;

    /** @member {boolean} */
    this.testBefore = false;

    /** @member {string} */
    this.loopExpression = "";
  }
}

/**
 * @const {string}
 */
BPMNActivity.MIB_NONE = "none";

/**
 * @const {string}
 */
BPMNActivity.MIB_ONE = "one";

/**
 * @const {string}
 */
BPMNActivity.MIB_ALL = "all";

/**
 * @const {string}
 */
BPMNActivity.MIB_COMPLEX = "complex";

/**
 * BPMNCallActivity
 */
class BPMNCallActivity extends BPMNActivity {
  constructor() {
    super();

    /** @member {BPMNActivity} */
    this.calledRef = null;
  }
}

/**
 * BPMNTask
 */
class BPMNTask extends BPMNActivity {
  constructor() {
    super();

    /** @member {boolean} */
    this.isGlobal = false;
  }
}

/**
 * BPMNSendTask
 */
class BPMNSendTask extends BPMNTask {
  constructor() {
    super();

    /** @member {string} */
    this.implementation = "";
  }
}

/**
 * BPMNReceiveTask
 */
class BPMNReceiveTask extends BPMNTask {
  constructor() {
    super();

    /** @member {string} */
    this.implementation = "";

    /** @member {boolean} */
    this.instantiate = false;
  }
}

/**
 * BPMNServiceTask
 */
class BPMNServiceTask extends BPMNTask {
  constructor() {
    super();

    /** @member {string} */
    this.implementation = "";
  }
}

/**
 * BPMNUserTask
 */
class BPMNUserTask extends BPMNTask {
  constructor() {
    super();

    /** @member {string} */
    this.implementation = "";
  }
}

/**
 * BPMNManualTask
 */
class BPMNManualTask extends BPMNTask {}

/**
 * BPMNBusinessRuleTask
 */
class BPMNBusinessRuleTask extends BPMNTask {
  constructor() {
    super();

    /** @member {string} */
    this.implementation = "";
  }
}

/**
 * BPMNScriptTask
 */
class BPMNScriptTask extends BPMNTask {
  constructor() {
    super();

    /** @member {string} */
    this.scriptFormat = "";

    /** @member {string} */
    this.script = "";
  }
}

/**
 * BPMNSubProcess
 */
class BPMNSubProcess extends BPMNActivity {
  constructor() {
    super();

    /** @member {boolean} */
    this.triggeredByEvent = false;
  }
}

/**
 * BPMNAdHocSubProcess
 */
class BPMNAdHocSubProcess extends BPMNSubProcess {}

/**
 * BPMNTransaction
 */
class BPMNTransaction extends BPMNSubProcess {}

/* ----------------------------- CHOREOGRAPHY ------------------------------- */

/**
 * BPMNChoreographyActivity
 */
class BPMNChoreographyActivity extends BPMNFlowElement {
  constructor() {
    super();

    /** @member {BPMNChoreographyLoopType} */
    this.loopType = BPMNChoreographyActivity.LT_NONE;

    /** @member {BPMNParticipant} */
    this.initiatingParticipant = null;

    /** @member {Array<BPMNParticipant>} */
    this.upperParticipants = [];

    /** @member {Array<BPMNParticipant>} */
    this.lowerParticipants = [];
  }
}

/**
 * @const {string}
 */
BPMNChoreographyActivity.LT_NONE = "none";

/**
 * @const {string}
 */
BPMNChoreographyActivity.LT_STANDARD = "standard";

/**
 * @const {string}
 */
BPMNChoreographyActivity.LT_MULTIINSTANCE_SEQUENTIAL =
  "multiInstanceSequential";

/**
 * @const {string}
 */
BPMNChoreographyActivity.LT_MULTIINSTANCE_PARALLEL = "multiInstanceParallel";

/**
 * BPMNChoreographyTask
 */
class BPMNChoreographyTask extends BPMNChoreographyActivity {}

/**
 * BPMNSubChoreography
 */
class BPMNSubChoreography extends BPMNChoreographyActivity {}

/**
 * BPMNCallChoreography
 */
class BPMNCallChoreography extends BPMNChoreographyActivity {}

/* --------------------------------- EVENTS --------------------------------- */

/**
 * BPMNEventDefinition
 */
class BPMNEventDefinition extends BPMNRootElement {}

/**
 * BPMNCompensateEventDefinition
 */
class BPMNCompensateEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNCancelEventDefinition
 */
class BPMNCancelEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNErrorEventDefinition
 */
class BPMNErrorEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNLinkEventDefinition
 */
class BPMNLinkEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNSignalEventDefinition
 */
class BPMNSignalEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNTimerEventDefinition
 */
class BPMNTimerEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNEscalationEventDefinition
 */
class BPMNEscalationEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNMessageEventDefinition
 */
class BPMNMessageEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNTerminateEventDefinition
 */
class BPMNTerminateEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNConditionalEventDefinition
 */
class BPMNConditionalEventDefinition extends BPMNEventDefinition {}

/**
 * BPMNEvent
 */
class BPMNEvent extends BPMNFlowElement {
  constructor() {
    super();

    /** @member {Array.<BPMNEventDefinition>} */
    this.eventDefinitions = [];
  }
}

/**
 * BPMNThrowEvent
 */
class BPMNThrowEvent extends BPMNEvent {}

/**
 * BPMNCatchEvent
 */
class BPMNCatchEvent extends BPMNEvent {
  constructor() {
    super();

    /** @member {boolean} */
    this.parallelMultiple = false;
  }
}

/**
 * BPMNImplicitThrowEvent
 */
class BPMNImplicitThrowEvent extends BPMNThrowEvent {}

/**
 * BPMNIntermediateThrowEvent
 */
class BPMNIntermediateThrowEvent extends BPMNThrowEvent {}

/**
 * BPMNEndEvent
 */
class BPMNEndEvent extends BPMNThrowEvent {}

/**
 * BPMNStartEvent
 */
class BPMNStartEvent extends BPMNCatchEvent {
  constructor() {
    super();

    /** @member {boolean} */
    this.isInterrupting = false;
  }
}

/**
 * BPMNIntermediateCatchEvent
 */
class BPMNIntermediateCatchEvent extends BPMNCatchEvent {}

/**
 * BPMNBoundaryEvent
 */
class BPMNBoundaryEvent extends BPMNCatchEvent {
  constructor() {
    super();

    /** @member {boolean} */
    this.cancelActivity = false;
  }
}

/* -------------------------------- GATEWAYS -------------------------------- */

/**
 * BPMNGateway
 */
class BPMNGateway extends BPMNFlowElement {
  constructor() {
    super();

    /** @member {string} */
    this.gatewayDirection = BPMNGateway.GD_UNSPECIFIED;
  }
}

/**
 * @const {string}
 */
BPMNGateway.GD_UNSPECIFIED = "unspecified";

/**
 * @const {string}
 */
BPMNGateway.GD_CONVERGING = "converging";

/**
 * @const {string}
 */
BPMNGateway.GD_DIVERGING = "diverging";

/**
 * @const {string}
 */
BPMNGateway.GD_MIXED = "mixed";

/**
 * BPMNExclusiveGateway
 */
class BPMNExclusiveGateway extends BPMNGateway {
  constructor() {
    super();

    /** @member {BPMNSequenceFlow} */
    this.default = null;
  }
}

/**
 * BPMNInclusiveGateway
 */
class BPMNInclusiveGateway extends BPMNGateway {
  constructor() {
    super();

    /** @member {BPMNSequenceFlow} */
    this.default = null;
  }
}

/**
 * BPMNParallelGateway
 */
class BPMNParallelGateway extends BPMNGateway {}

/**
 * BPMNComplexGateway
 */
class BPMNComplexGateway extends BPMNGateway {
  constructor() {
    super();

    /** @member {BPMNSequenceFlow} */
    this.default = null;
  }
}

/**
 * BPMNEventBasedGateway
 */
class BPMNEventBasedGateway extends BPMNGateway {
  constructor() {
    super();

    /** @member {boolean} */
    this.instantiate = false;

    /** @member {BPMNEventBasedGatewayType} */
    this.eventGatewayType = BPMNEventBasedGateway.EGT_EXCLUSIVE;
  }
}

/**
 * @const {string}
 */
BPMNEventBasedGateway.EGT_PARALLEL = "parallel";

/**
 * @const {string}
 */
BPMNEventBasedGateway.EGT_EXCLUSIVE = "exclusive";

/* ----------------------------- DATA OBJECTS ------------------------------- */

/**
 * BPMNItemAwareElement
 */
class BPMNItemAwareElement extends BPMNBaseElement {}

/**
 * BPMNDataObject
 */
class BPMNDataObject extends BPMNItemAwareElement {
  constructor() {
    super();

    /** @member {boolean} */
    this.isCollection = false;
  }
}

/**
 * BPMNDataStore
 */
class BPMNDataStore extends BPMNItemAwareElement {}

/**
 * BPMNDataInput
 */
class BPMNDataInput extends BPMNItemAwareElement {}

/**
 * BPMNDataOutput
 */
class BPMNDataOutput extends BPMNItemAwareElement {}

/* -------------------------------- MESSAGE --------------------------------- */

/**
 * BPMNMessage
 */
class BPMNMessage extends BPMNRootElement {}

/* ----------------------------- CONVERSATIONS ------------------------------ */

/**
 * BPMNConversationNode
 */
class BPMNConversationNode extends BPMNBaseElement {}

/**
 * BPMNConversation
 */
class BPMNConversation extends BPMNConversationNode {}

/**
 * BPMNSubConversation
 */
class BPMNSubConversation extends BPMNConversationNode {}

/**
 * BPMNCallConversation
 */
class BPMNCallConversation extends BPMNConversationNode {
  constructor() {
    super();

    /** @member {BPMNCollaboration} */
    this.calledRef = null;
  }
}

/**
 * BPMNConversationLink
 */
class BPMNConversationLink extends DirectedRelationship {}

/* ------------------------------- ARTIFACTS -------------------------------- */

/**
 * BPMNArtifact
 */
class BPMNArtifact extends BPMNBaseElement {}

/**
 * BPMNTextAnnotation
 */
class BPMNTextAnnotation extends BPMNArtifact {
  constructor() {
    super();

    /** @member {string} */
    this.text = "";
  }
}

/**
 * BPMNGroup
 */
class BPMNGroup extends BPMNArtifact {}

/**
 * BPMNAssociation
 */
class BPMNAssociation extends DirectedRelationship {
  constructor() {
    super();

    /** @member {boolean} */
    this.associationDirection = BPMNAssociation.AD_NONE;
  }
}

/**
 * @const {string}
 */
BPMNAssociation.AD_NONE = "none";

/**
 * @const {string}
 */
BPMNAssociation.AD_ONE = "one";

/**
 * @const {string}
 */
BPMNAssociation.AD_BOTH = "both";

/**
 * BPMNDataAssociation
 */
class BPMNDataAssociation extends DirectedRelationship {}

/* --------------------------------- FLOWS ---------------------------------- */

/**
 * BPMNSequenceFlow
 */
class BPMNSequenceFlow extends DirectedRelationship {
  constructor() {
    super();

    /** @member {boolean} */
    this.isImmediate = false;

    /** @member {string} */
    this.condition = "";
  }
}

/**
 * BPMNMessageFlow
 */
class BPMNMessageFlow extends DirectedRelationship {
  constructor() {
    super();

    /** @member {BPMNMessage} */
    this.messageRef = null;
  }
}

/**
 * BPMNMessageLink
 */
class BPMNMessageLink extends DirectedRelationship {}

/* -------------------------- View Elements ---------------------------- */

/**
 * BPMNGeneralNodeView
 */
class BPMNGeneralNodeView extends NodeView {
  constructor() {
    super();
    this.containerChangeable = true;

    /** @member {LabelView} */
    this.nameLabel = new LabelView();
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER;
    this.nameLabel.verticalAlignment = Canvas.AL_MIDDLE;
    this.nameLabel.parentStyle = true;
    this.addSubView(this.nameLabel);

    /** @member {boolean} */
    this.wordWrap = true;
  }

  update(canvas) {
    super.update(canvas);
    if (this.model) {
      this.nameLabel.text = this.model.name;
    }
    this.nameLabel.wordWrap = this.wordWrap;
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING;
    this.minHeight = this.nameLabel.minHeight + TOP_PADDING + BOTTOM_PADDING;
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);
    this.nameLabel.left = this.left;
    this.nameLabel.setRight(this.getRight());
    this.nameLabel.top =
      Math.round((this.top + this.getBottom()) / 2) -
      Math.round(this.nameLabel.height / 2);

    // this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING
    // this.nameLabel.height = Math.max(this.nameLabel.minHeight, this.height - TOP_PADDING - BOTTOM_PADDING)
  }

  drawObject(canvas) {
    canvas.fillRoundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      ACTIVITY_ROUND,
    );
    canvas.roundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      ACTIVITY_ROUND,
    );
    super.drawObject(canvas);
  }
}

/**
 * BPMNFloatingNodeView
 */
class BPMNFloatingNodeView extends NodeView {
  constructor() {
    super();
    this.containerExtending = false;

    /** @member {NodeLabelView} */
    this.nameLabel = new NodeLabelView();
    this.nameLabel.distance = 36;
    this.nameLabel.alpha = -2 * (Math.PI / 4);
    this.addSubView(this.nameLabel);

    /** @member {boolean} */
    this.wordWrap = true;
  }

  update(canvas) {
    super.update(canvas);
    if (this.model) {
      this.nameLabel.text = this.model.name;
      // nameLabel이 model을 정상적으로 reference 할 수 있도록 Bypass Command에 의해서 설정한다.
      if (this.nameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameLabel, "model", this.model);
      }
    }
  }

  arrange(canvas) {
    this.nameLabel.visible = this.nameLabel.text.length > 0;
    super.arrange(canvas);
  }
}

/**
 * BPMNGeneralEdgeView
 */
class BPMNGeneralEdgeView extends type.EdgeView {
  constructor() {
    super();
    this.tailEndStyle = EdgeView.ES_FLAT;
    this.headEndStyle = EdgeView.ES_SOLID_ARROW;
    this.lineMode = EdgeView.LM_SOLID;

    /** @member {EdgeLabelView} */
    this.nameLabel = new EdgeLabelView();
    this.nameLabel.hostEdge = this;
    this.nameLabel.edgePosition = EdgeParasiticView.EP_MIDDLE;
    this.nameLabel.distance = 15;
    this.nameLabel.alpha = Math.PI / 2;
    this.addSubView(this.nameLabel);
  }

  update(canvas) {
    if (this.model) {
      // nameLabel
      this.nameLabel.visible = this.model.name.length > 0;
      if (this.model.name) {
        this.nameLabel.text = this.model.name;
      }
      // Enforce nameLabel.mode refers to this.model by using Bypass Command.
      if (this.nameLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.nameLabel, "model", this.model);
      }
    }
    super.update(canvas);
  }
}

/**
 * BPMNActivityView
 */
class BPMNActivityView extends BPMNGeneralNodeView {
  constructor() {
    super();
    this.containerChangeable = true;
    this.fillColor =
      app.preferences.get("bpmn.activity.fillColor", "#ffffff") ||
      app.preferences.get("view.fillColor", "#ffffff");
    this._markers = []; // ['loop', 'seq', 'par', 'sub', 'compensate']
  }

  update(canvas) {
    super.update(canvas);
    this._markers = [];
    if (this.model.isLoop === true && !this._markers.includes("loop")) {
      this._markers.push("loop");
    }
    if (this.model.isMultiInstance === true) {
      if (this.model.isSequential) {
        if (!this._markers.includes("seq")) this._markers.push("seq");
      } else {
        if (!this._markers.includes("par")) this._markers.push("par");
      }
    }
    if (this.model.isForCompensation) {
      if (!this._markers.includes("compensate"))
        this._markers.push("compensate");
    }
  }

  drawObject(canvas) {
    canvas.fillRoundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      ACTIVITY_ROUND,
    );
    canvas.roundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      ACTIVITY_ROUND,
    );
    const xc = Math.round((this.left + this.getRight()) / 2);
    let mx = xc - Math.round((this._markers.length * 14) / 2);
    if (this._markers.includes("loop")) {
      canvas.arc(
        mx + 6,
        this.getBottom() - 9,
        4,
        -Math.PI * 1.35,
        Math.PI * 0.3,
      );
      canvas.line(mx + 5, this.getBottom() - 5, mx + 1, this.getBottom() - 5);
      canvas.line(mx + 5, this.getBottom() - 5, mx + 5, this.getBottom() - 9);
      mx += 14;
    }
    if (this._markers.includes("seq")) {
      canvas.line(
        mx + 2,
        this.getBottom() - 13,
        mx + 12,
        this.getBottom() - 13,
      );
      canvas.line(mx + 2, this.getBottom() - 9, mx + 12, this.getBottom() - 9);
      canvas.line(mx + 2, this.getBottom() - 5, mx + 12, this.getBottom() - 5);
      mx += 14;
    }
    if (this._markers.includes("par")) {
      canvas.line(mx + 6, this.getBottom() - 14, mx + 6, this.getBottom() - 4);
      canvas.line(mx + 2, this.getBottom() - 14, mx + 2, this.getBottom() - 4);
      canvas.line(
        mx + 10,
        this.getBottom() - 14,
        mx + 10,
        this.getBottom() - 4,
      );
      mx += 14;
    }
    if (this._markers.includes("compensate")) {
      canvas.polygon([
        new Point(mx + 1, this.getBottom() - 9),
        new Point(mx + 7, this.getBottom() - 15),
        new Point(mx + 7, this.getBottom() - 3),
        new Point(mx + 1, this.getBottom() - 9),
      ]);
      canvas.polygon([
        new Point(mx + 7, this.getBottom() - 9),
        new Point(mx + 13, this.getBottom() - 15),
        new Point(mx + 13, this.getBottom() - 3),
        new Point(mx + 7, this.getBottom() - 9),
      ]);
      mx += 14;
    }
    if (this._markers.includes("sub")) {
      canvas.rect(mx + 1, this.getBottom() - 15, mx + 13, this.getBottom() - 3);
      canvas.line(mx + 3, this.getBottom() - 9, mx + 11, this.getBottom() - 9);
      canvas.line(mx + 7, this.getBottom() - 13, mx + 7, this.getBottom() - 5);
      mx += 14;
    }
    if (this._markers.includes("adhoc")) {
      canvas.textOut(mx + 1, this.getBottom() - 15, "~");
    }
  }

  drawShadow(canvas) {
    canvas.storeState();
    canvas.alpha = SHADOW_ALPHA;
    canvas.fillColor = SHADOW_COLOR;
    canvas.fillRoundRect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      ACTIVITY_ROUND,
    );
    canvas.restoreState();
  }
}

/**
 * BPMNCallActivityView
 */
class BPMNCallActivityView extends BPMNActivityView {
  update(canvas) {
    super.update(canvas);
    if (this.model.calledRef instanceof BPMNSubProcess) {
      if (!this._markers.includes("sub")) this._markers.push("sub");
    }
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    // canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), ACTIVITY_ROUND)
    canvas.lineWidth = 3;
    canvas.roundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      ACTIVITY_ROUND,
    );
    canvas.lineWidth = 1;
    const isSend = this.model.calledRef instanceof BPMNSendTask;
    const isReceive = this.model.calledRef instanceof BPMNReceiveTask;
    const isService = this.model.calledRef instanceof BPMNServiceTask;
    const isUser = this.model.calledRef instanceof BPMNUserTask;
    const isManual = this.model.calledRef instanceof BPMNManualTask;
    const isBusinessRule = this.model.calledRef instanceof BPMNBusinessRuleTask;
    const isScript = this.model.calledRef instanceof BPMNScriptTask;
    const x1 = this.left + 6;
    const y1 = this.top + 6;
    const x2 = x1 + 14;
    const y2 = y1 + 14;
    const xc = Math.round((x1 + x2) / 2);
    const yc = Math.round((y1 + y2) / 2);
    if (isSend) {
      canvas.storeState();
      canvas.fillColor = this.lineColor;
      canvas.fillPolygon([
        new Point(x1, y1),
        new Point(xc, y1 + 5),
        new Point(x2, y1),
        new Point(x1, y1),
      ]);
      canvas.fillPolygon([
        new Point(x1, y1 + 2),
        new Point(xc, y1 + 7),
        new Point(x2, y1 + 2),
        new Point(x2, y2 - 4),
        new Point(x1, y2 - 4),
        new Point(x1, y1 + 2),
      ]);
      canvas.restoreState();
    }
    if (isReceive) {
      canvas.rect(x1, y1 + 1, x2, y2 - 3);
      canvas.line(x1, y1 + 1, xc, y1 + 7);
      canvas.line(xc, y1 + 7, x2, y1 + 1);
      if (this.model.instantiate) {
        canvas.ellipse(x1 - 4, y1 - 3, x2 + 4, y2 + 2);
      }
    }
    if (isService) {
      canvas.lineWidth = 3;
      canvas.storeState();
      canvas.fillColor = this.lineColor;
      canvas.ellipse(xc - 4, yc - 4, xc + 4, yc + 4);
      canvas.fillEllipse(xc - 2, yc - 8, xc + 2, yc - 4);
      canvas.fillEllipse(xc - 2, yc + 4, xc + 2, yc + 8);
      canvas.fillEllipse(xc - 7, yc + 1, xc - 3, yc + 5);
      canvas.fillEllipse(xc - 7, yc - 5, xc - 3, yc - 1);
      canvas.fillEllipse(xc + 7, yc + 1, xc + 3, yc + 5);
      canvas.fillEllipse(xc + 7, yc - 5, xc + 3, yc - 1);
      canvas.restoreState();
      canvas.lineWidth = 1;
    }
    if (isUser) {
      canvas.ellipse(xc - 3, y1, xc + 3, y1 + 6);
      canvas.rect(x1 + 2, y1 + 7, x2 - 2, y2);
    }
    if (isManual) {
      canvas.polygon([
        new Point(x1, yc - 4),
        new Point(x1 + 3, yc - 4),
        new Point(x1 + 5, y1),
        new Point(x2 - 4, y1),
        new Point(x2 - 4, y1 + 3),
        new Point(x2, y1 + 3),
        new Point(x2, y2 - 2),
        new Point(x1 + 5, y2 - 2),
        new Point(x1 + 3, y2 - 4),
        new Point(x1, y2 - 4),
        new Point(x1, yc - 4),
      ]);
      canvas.line(xc, y1 + 3, x2, y1 + 3);
      canvas.line(xc, y1 + 6, x2, y1 + 6);
      canvas.line(xc, y1 + 9, x2, y1 + 9);
    }
    if (isBusinessRule) {
      canvas.rect(x1, y1, x2, y2 - 3);
      canvas.line(x1, y1 + 3, x2, y1 + 3);
      canvas.line(x1, y1 + 6, x2, y1 + 6);
      canvas.line(x1 + 3, y1, x1 + 3, y2 - 3);
    }
    if (isScript) {
      canvas.polygon([
        new Point(x1 + 3, y1),
        new Point(x2, y1),
        new Point(x2 - 3, y1 + 4),
        new Point(x2, y1 + 8),
        new Point(x2 - 3, y1 + 12),
        new Point(x1, y1 + 12),
        new Point(x1 + 3, y1 + 8),
        new Point(x1, y1 + 4),
        new Point(x1 + 3, y1),
      ]);
      canvas.line(x1 + 3, y1 + 3, x2 - 4, y1 + 3);
      canvas.line(x1 + 3.5, y1 + 6, x2 - 3.5, y1 + 6);
      canvas.line(x1 + 4, y1 + 9, x2 - 3, y1 + 9);
    }
  }
}

/**
 * BPMNTaskView
 */
class BPMNTaskView extends BPMNActivityView {
  drawObject(canvas) {
    super.drawObject(canvas);
    const isSend = this.model instanceof BPMNSendTask;
    const isReceive = this.model instanceof BPMNReceiveTask;
    const isService = this.model instanceof BPMNServiceTask;
    const isUser = this.model instanceof BPMNUserTask;
    const isManual = this.model instanceof BPMNManualTask;
    const isBusinessRule = this.model instanceof BPMNBusinessRuleTask;
    const isScript = this.model instanceof BPMNScriptTask;
    const x1 = this.left + 6;
    const y1 = this.top + 6;
    const x2 = x1 + 14;
    const y2 = y1 + 14;
    const xc = Math.round((x1 + x2) / 2);
    const yc = Math.round((y1 + y2) / 2);
    if (isSend) {
      canvas.storeState();
      canvas.fillColor = this.lineColor;
      canvas.fillPolygon([
        new Point(x1, y1),
        new Point(xc, y1 + 5),
        new Point(x2, y1),
        new Point(x1, y1),
      ]);
      canvas.fillPolygon([
        new Point(x1, y1 + 2),
        new Point(xc, y1 + 7),
        new Point(x2, y1 + 2),
        new Point(x2, y2 - 4),
        new Point(x1, y2 - 4),
        new Point(x1, y1 + 2),
      ]);
      canvas.restoreState();
    }
    if (isReceive) {
      canvas.rect(x1, y1 + 1, x2, y2 - 3);
      canvas.line(x1, y1 + 1, xc, y1 + 7);
      canvas.line(xc, y1 + 7, x2, y1 + 1);
      if (this.model.instantiate) {
        canvas.ellipse(x1 - 4, y1 - 3, x2 + 4, y2 + 2);
      }
    }
    if (isService) {
      canvas.lineWidth = 3;
      canvas.storeState();
      canvas.fillColor = this.lineColor;
      canvas.ellipse(xc - 4, yc - 4, xc + 4, yc + 4);
      canvas.fillEllipse(xc - 2, yc - 8, xc + 2, yc - 4);
      canvas.fillEllipse(xc - 2, yc + 4, xc + 2, yc + 8);
      canvas.fillEllipse(xc - 7, yc + 1, xc - 3, yc + 5);
      canvas.fillEllipse(xc - 7, yc - 5, xc - 3, yc - 1);
      canvas.fillEllipse(xc + 7, yc + 1, xc + 3, yc + 5);
      canvas.fillEllipse(xc + 7, yc - 5, xc + 3, yc - 1);
      canvas.restoreState();
      canvas.lineWidth = 1;
    }
    if (isUser) {
      canvas.ellipse(xc - 3, y1, xc + 3, y1 + 6);
      canvas.rect(x1 + 2, y1 + 7, x2 - 2, y2);
    }
    if (isManual) {
      canvas.polygon([
        new Point(x1, yc - 4),
        new Point(x1 + 3, yc - 4),
        new Point(x1 + 5, y1),
        new Point(x2 - 4, y1),
        new Point(x2 - 4, y1 + 3),
        new Point(x2, y1 + 3),
        new Point(x2, y2 - 2),
        new Point(x1 + 5, y2 - 2),
        new Point(x1 + 3, y2 - 4),
        new Point(x1, y2 - 4),
        new Point(x1, yc - 4),
      ]);
      canvas.line(xc, y1 + 3, x2, y1 + 3);
      canvas.line(xc, y1 + 6, x2, y1 + 6);
      canvas.line(xc, y1 + 9, x2, y1 + 9);
    }
    if (isBusinessRule) {
      canvas.rect(x1, y1, x2, y2 - 3);
      canvas.line(x1, y1 + 3, x2, y1 + 3);
      canvas.line(x1, y1 + 6, x2, y1 + 6);
      canvas.line(x1 + 3, y1, x1 + 3, y2 - 3);
    }
    if (isScript) {
      canvas.polygon([
        new Point(x1 + 3, y1),
        new Point(x2, y1),
        new Point(x2 - 3, y1 + 4),
        new Point(x2, y1 + 8),
        new Point(x2 - 3, y1 + 12),
        new Point(x1, y1 + 12),
        new Point(x1 + 3, y1 + 8),
        new Point(x1, y1 + 4),
        new Point(x1 + 3, y1),
      ]);
      canvas.line(x1 + 3, y1 + 3, x2 - 4, y1 + 3);
      canvas.line(x1 + 3.5, y1 + 6, x2 - 3.5, y1 + 6);
      canvas.line(x1 + 4, y1 + 9, x2 - 3, y1 + 9);
    }
  }
}

/**
 * BPMNSubProcessView
 */
class BPMNSubProcessView extends BPMNActivityView {
  update(canvas) {
    super.update(canvas);
    if (!this._markers.includes("sub")) this._markers.push("sub");
  }
}

/**
 * BPMNAdHocSubProcessView
 */
class BPMNAdHocSubProcessView extends BPMNActivityView {
  update(canvas) {
    super.update(canvas);
    if (!this._markers.includes("sub")) this._markers.push("sub");
    if (!this._markers.includes("adhoc")) this._markers.push("adhoc");
  }
}

/**
 * BPMNTransactionView
 */
class BPMNTransactionView extends BPMNActivityView {
  update(canvas) {
    super.update(canvas);
    if (!this._markers.includes("sub")) this._markers.push("sub");
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    const gap = 3;
    canvas.roundRect(
      this.left + gap,
      this.top + gap,
      this.getRight() - gap,
      this.getBottom() - gap,
      8,
    );
  }
}

/**
 * BPMNChoreographyActivityView
 */
class BPMNChoreographyActivityView extends BPMNGeneralNodeView {
  constructor() {
    super();
    this.fillColor =
      app.preferences.get("bpmn.activity.fillColor", "#ffffff") ||
      app.preferences.get("view.fillColor", "#ffffff");
    this._markers = []; // ['loop', 'seq', 'par', 'sub']
  }

  update(canvas) {
    super.update(canvas);
    this._markers = [];
    if (this.model.loopType === BPMNChoreographyTask.LT_STANDARD) {
      if (!this._markers.includes("loop")) this._markers.push("loop");
    }
    if (
      this.model.loopType === BPMNChoreographyTask.LT_MULTIINSTANCE_SEQUENTIAL
    ) {
      if (!this._markers.includes("seq")) this._markers.push("seq");
    } else if (
      this.model.loopType === BPMNChoreographyTask.LT_MULTIINSTANCE_PARALLEL
    ) {
      if (!this._markers.includes("par")) this._markers.push("par");
    }
  }

  drawObject(canvas) {
    canvas.fillRoundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      ACTIVITY_ROUND,
    );
    let tp = this.top;
    let bp = this.getBottom();
    const extent = canvas.textExtent("^_y", 100);
    const h = extent.y + TOP_PADDING + BOTTOM_PADDING;
    if (this.model.initiatingParticipant) {
      const ui = this.model.upperParticipants.indexOf(
        this.model.initiatingParticipant,
      );
      const li = this.model.lowerParticipants.indexOf(
        this.model.initiatingParticipant,
      );
      if (ui > -1) {
        canvas.fillColor = "#c6c6c6";
        canvas.fillRoundRect2(
          this.left,
          this.top + ui * h,
          this.getRight(),
          this.top + h * ui + h,
          ui === 0 ? [ACTIVITY_ROUND, ACTIVITY_ROUND, 0, 0] : [0, 0, 0, 0],
        );
        canvas.fillColor = this.fillColor;
      } else if (li > -1) {
        canvas.fillColor = "#c6c6c6";
        canvas.fillRoundRect2(
          this.left,
          this.getBottom() - (this.model.lowerParticipants.length - li - 1) * h,
          this.getRight(),
          this.getBottom() -
            h * (this.model.lowerParticipants.length - li - 1) -
            h,
          li === this.model.lowerParticipants.length - 1
            ? [0, 0, ACTIVITY_ROUND, ACTIVITY_ROUND]
            : [0, 0, 0, 0],
        );
        canvas.fillColor = this.fillColor;
      }
    }
    for (let i = 0; i < this.model.upperParticipants.length; i++) {
      const p = this.model.upperParticipants[i];
      tp += TOP_PADDING;
      const rect = new Rect(this.left, tp, this.getRight(), tp);
      canvas.textOut2(
        rect,
        p.name,
        Canvas.AL_CENTER,
        Canvas.AL_TOP,
        false,
        false,
        false,
      );
      tp += extent.y + BOTTOM_PADDING;
      canvas.line(this.left, tp, this.getRight(), tp);
    }
    for (let i = this.model.lowerParticipants.length - 1; i >= 0; i--) {
      const p = this.model.lowerParticipants[i];
      bp -= BOTTOM_PADDING + extent.y;
      const rect = new Rect(this.left, bp, this.getRight(), bp);
      canvas.textOut2(
        rect,
        p.name,
        Canvas.AL_CENTER,
        Canvas.AL_TOP,
        false,
        false,
        false,
      );
      bp -= TOP_PADDING;
      canvas.line(this.left, bp, this.getRight(), bp);
    }
    canvas.roundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      ACTIVITY_ROUND,
    );
    // markers
    const xc = Math.round((this.left + this.getRight()) / 2);
    const bottom = this.getBottom() - h * this.model.lowerParticipants.length;
    let mx = xc - Math.round((this._markers.length * 14) / 2);
    if (this._markers.includes("loop")) {
      canvas.arc(mx + 6, bottom - 9, 4, -Math.PI * 1.35, Math.PI * 0.3);
      canvas.line(mx + 5, bottom - 5, mx + 1, bottom - 5);
      canvas.line(mx + 5, bottom - 5, mx + 5, bottom - 9);
      mx += 14;
    }
    if (this._markers.includes("seq")) {
      canvas.line(mx + 2, bottom - 13, mx + 12, bottom - 13);
      canvas.line(mx + 2, bottom - 9, mx + 12, bottom - 9);
      canvas.line(mx + 2, bottom - 5, mx + 12, bottom - 5);
      mx += 14;
    }
    if (this._markers.includes("par")) {
      canvas.line(mx + 6, bottom - 14, mx + 6, bottom - 4);
      canvas.line(mx + 2, bottom - 14, mx + 2, bottom - 4);
      canvas.line(mx + 10, bottom - 14, mx + 10, bottom - 4);
      mx += 14;
    }
    if (this._markers.includes("sub")) {
      canvas.rect(mx + 1, bottom - 15, mx + 13, bottom - 3);
      canvas.line(mx + 3, bottom - 9, mx + 11, bottom - 9);
      canvas.line(mx + 7, bottom - 13, mx + 7, bottom - 5);
      mx += 14;
    }
    if (this._markers.includes("adhoc")) {
      canvas.textOut(mx + 1, bottom - 15, "~");
    }
  }

  drawShadow(canvas) {
    canvas.storeState();
    canvas.alpha = SHADOW_ALPHA;
    canvas.fillColor = SHADOW_COLOR;
    canvas.fillRoundRect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      ACTIVITY_ROUND,
    );
    canvas.restoreState();
  }
}

/**
 * BPMNChoreographyTaskView
 */
class BPMNChoreographyTaskView extends BPMNChoreographyActivityView {}

/**
 * BPMNSubChoreographyView
 */
class BPMNSubChoreographyView extends BPMNChoreographyActivityView {
  update(canvas) {
    super.update(canvas);
    if (!this._markers.includes("sub")) this._markers.push("sub");
  }
}

/**
 * BPMNEventView
 */
class BPMNEventView extends BPMNFloatingNodeView {
  constructor() {
    super();
    this.containerChangeable = true;
    this.sizable = NodeView.SZ_RATIO;
    this.fillColor =
      app.preferences.get("bpmn.event.fillColor", "#ffffff") ||
      app.preferences.get("view.fillColor", "#ffffff");
  }

  update(canvas) {
    super.update(canvas);
    this.containerChangeable = !(this.model instanceof BPMNBoundaryEvent);
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = EVENT_MINWIDTH;
    this.minHeight = EVENT_MINHEIGHT;
  }

  /**
   * Compute Junction Point
   *
   * @param {Rect} r
   * @param {Point} p
   * @return {Point}
   */
  _junction2(r, p) {
    var c = new Point();
    c.x = (r.x1 + r.x2) / 2;
    c.y = (r.y1 + r.y2) / 2;
    if (c.x === p.x || c.y === p.y) {
      return Coord.orthoJunction(r, p);
    }
    var lean = (p.y - c.y) / (p.x - c.x);
    // contact points
    var cp = [];
    cp[0] = new Point(r.x1, Math.round(lean * (r.x1 - c.x) + c.y)); // left
    cp[1] = new Point(r.x2, Math.round(lean * (r.x2 - c.x) + c.y)); // right
    cp[2] = new Point(Math.round((r.y1 - c.y) / lean + c.x), r.y1); // top
    cp[3] = new Point(Math.round((r.y2 - c.y) / lean + c.x), r.y2); // bottom

    var i;
    if (Coord.ptInRect2(p, r)) {
      var idx = 0;
      var md = Math.sqrt(
        (cp[0].x - p.x) * (cp[0].x - p.x) + (cp[0].y - p.y) * (cp[0].y - p.y),
      );
      for (i = 1; i <= 3; i++) {
        var d = Math.sqrt(
          (cp[i].x - p.x) * (cp[i].x - p.x) + (cp[i].y - p.y) * (cp[i].y - p.y),
        );
        if (d < md) {
          md = d;
          idx = i;
        }
      }
      return cp[idx];
    } else {
      var cpRect = new Rect(c.x, c.y, p.x, p.y);
      Coord.normalizeRect(cpRect);
      c.x = cpRect.x1;
      c.y = cpRect.y1;
      p.x = cpRect.x2;
      p.y = cpRect.y2;
      i = -1;
      do {
        i++;
      } while (
        !(
          (r.x1 <= cp[i].x &&
            cp[i].x <= r.x2 &&
            r.y1 <= cp[i].y &&
            cp[i].y <= r.y2 &&
            c.x <= cp[i].x &&
            cp[i].x <= p.x &&
            c.y <= cp[i].y &&
            cp[i].y <= p.y) ||
          i > 4
        )
      );
      if (i > 3) {
        return new Point((r.x1 + r.x2) / 2, (r.y1 + r.y2) / 2);
      } else {
        return cp[i];
      }
    }
  }

  arrange(canvas) {
    if (this.containerView && this.containerView instanceof BPMNActivityView) {
      var r = this.containerView.getBoundingBox(canvas);
      var c = Coord.getCenter(
        new Rect(this.left, this.top, this.getRight(), this.getBottom()),
      );
      var p = this._junction2(r, c);
      this.left = p.x - EVENT_MINWIDTH / 2;
      this.top = p.y - EVENT_MINHEIGHT / 2;
      this.setRight(p.x + EVENT_MINWIDTH / 2);
      this.setBottom(p.y + EVENT_MINHEIGHT / 2);
    }
    super.arrange(canvas);
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    const inSubProcess =
      this.model._parent instanceof BPMNSubProcess ||
      this.model._parent._parent instanceof BPMNSubProcess;
    const isMessage = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNMessageEventDefinition,
    );
    const isTimer = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNTimerEventDefinition,
    );
    const isError = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNErrorEventDefinition,
    );
    const isEscalation = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNEscalationEventDefinition,
    );
    const isCancel = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNCancelEventDefinition,
    );
    const isCompensate = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNCompensateEventDefinition,
    );
    const isConditional = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNConditionalEventDefinition,
    );
    const isLink = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNLinkEventDefinition,
    );
    const isSignal = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNSignalEventDefinition,
    );
    const isTerminate = this.model.eventDefinitions.some(
      (e) => e instanceof BPMNTerminateEventDefinition,
    );
    const isMultiple = this.model.eventDefinitions.length > 1;

    const isStart = this.model instanceof BPMNStartEvent;
    const isEnd = this.model instanceof BPMNEndEvent;
    const isIntermediateCatching =
      this.model instanceof BPMNIntermediateCatchEvent;
    const isIntermediateThrowing =
      this.model instanceof BPMNIntermediateThrowEvent;
    const isBoundary = this.model instanceof BPMNBoundaryEvent;

    const xc = (this.left + this.getRight()) / 2;
    const yc = (this.top + this.getBottom()) / 2;
    const g = Math.round(this.width / 4.3);
    const x1 = this.left + g;
    const y1 = this.top + g;
    const x2 = this.getRight() - g;
    const y2 = this.getBottom() - g;
    const w = Math.round(x2 - x1);
    if (isStart) {
      canvas.fillEllipse(
        this.left,
        this.top,
        this.getRight(),
        this.getBottom(),
      );
      canvas.ellipse(
        this.left,
        this.top,
        this.getRight(),
        this.getBottom(),
        inSubProcess && !this.model.isInterrupting ? [3, 3] : null,
      );
    }
    if (
      isIntermediateCatching ||
      isIntermediateThrowing ||
      (isBoundary && this.model.cancelActivity)
    ) {
      const gap = 3;
      canvas.fillEllipse(
        this.left,
        this.top,
        this.getRight(),
        this.getBottom(),
      );
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
      canvas.ellipse(
        this.left + gap,
        this.top + gap,
        this.getRight() - gap,
        this.getBottom() - gap,
      );
    }
    if (isBoundary && !this.model.cancelActivity) {
      const gap = 3;
      canvas.fillEllipse(
        this.left,
        this.top,
        this.getRight(),
        this.getBottom(),
      );
      canvas.ellipse(
        this.left,
        this.top,
        this.getRight(),
        this.getBottom(),
        [3, 3],
      );
      canvas.ellipse(
        this.left + gap,
        this.top + gap,
        this.getRight() - gap,
        this.getBottom() - gap,
        [3, 3],
      );
    }
    if (isEnd) {
      canvas.lineWidth = 3;
      canvas.fillEllipse(
        this.left,
        this.top,
        this.getRight(),
        this.getBottom(),
      );
      canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom());
      canvas.lineWidth = 1;
    }
    if (isMessage && !isMultiple) {
      if (isEnd || isIntermediateThrowing) {
        canvas.storeState();
        canvas.fillColor = this.lineColor;
        const t = Math.round(w * 0.1);
        canvas.fillPolygon([
          new Point(x1, this.top + Math.round(g * 1.2)),
          new Point(x2, this.top + Math.round(g * 1.2)),
          new Point(xc, yc - t),
          new Point(x1, this.top + Math.round(g * 1.2)),
        ]);
        canvas.fillPolygon([
          new Point(x1, this.top + Math.round(g * 1.2) + t),
          new Point(xc, yc),
          new Point(x2, this.top + Math.round(g * 1.2) + t),
          new Point(x2, this.getBottom() - Math.round(g * 1.2)),
          new Point(x1, this.getBottom() - Math.round(g * 1.2)),
          new Point(x1, this.top + Math.round(g * 1.2) + t),
        ]);
        canvas.restoreState();
      } else {
        canvas.rect(
          x1,
          this.top + Math.round(g * 1.2),
          x2,
          this.getBottom() - Math.round(g * 1.2),
        );
        canvas.line(x1, this.top + Math.round(g * 1.2), xc, yc);
        canvas.line(xc, yc, x2, this.top + Math.round(g * 1.2));
      }
    }
    if (isTimer && !isMultiple) {
      canvas.ellipse(x1, y1, x2, y2);
      canvas.line(xc, yc, xc, this.top + Math.round(g * 1.3));
      canvas.line(xc, yc, this.getRight() - Math.round(g * 1.3), yc);
    }
    if (isError && !isMultiple) {
      if (isEnd || isIntermediateThrowing) {
        canvas.storeState();
        canvas.fillColor = this.lineColor;
        canvas.fillPolygon([
          new Point(x1, y2 - Math.round(w * 0.1)),
          new Point(x1 + Math.round(w * 0.33), y1),
          new Point(x2 - Math.round(w * 0.33), y1 + Math.round(w * 0.5)),
          new Point(x2, y1 + Math.round(w * 0.1)),
          new Point(x2 - Math.round(w * 0.33), y2),
          new Point(x1 + Math.round(w * 0.33), y1 + Math.round(w * 0.5)),
          new Point(x1, y2 - Math.round(w * 0.1)),
        ]);
        canvas.restoreState();
      } else {
        canvas.polygon([
          new Point(x1, y2 - Math.round(w * 0.1)),
          new Point(x1 + Math.round(w * 0.33), y1),
          new Point(x2 - Math.round(w * 0.33), y1 + Math.round(w * 0.5)),
          new Point(x2, y1 + Math.round(w * 0.1)),
          new Point(x2 - Math.round(w * 0.33), y2),
          new Point(x1 + Math.round(w * 0.33), y1 + Math.round(w * 0.5)),
          new Point(x1, y2 - Math.round(w * 0.1)),
        ]);
      }
    }
    if (isEscalation && !isMultiple) {
      if (isEnd || isIntermediateThrowing) {
        canvas.storeState();
        canvas.fillColor = this.lineColor;
        canvas.fillPolygon([
          new Point(xc, y1),
          new Point(x1 + Math.round(w * 0.2), y2),
          new Point(xc, y1 + Math.round(w * 0.6)),
          new Point(x2 - Math.round(w * 0.2), y2),
          new Point(xc, y1),
        ]);
        canvas.restoreState();
      } else {
        canvas.polygon([
          new Point(xc, y1),
          new Point(x1 + Math.round(w * 0.2), y2),
          new Point(xc, y1 + Math.round(w * 0.6)),
          new Point(x2 - Math.round(w * 0.2), y2),
          new Point(xc, y1),
        ]);
      }
    }
    if (isCancel && !isMultiple) {
      const t = w * 0.15;
      if (isEnd || isIntermediateThrowing) {
        canvas.storeState();
        canvas.fillColor = this.lineColor;
        canvas.fillPolygon([
          new Point(x1, y1 + t),
          new Point(x1 + t, y1),
          new Point(xc, yc - t * 0.9),
          new Point(x2 - t, y1),
          new Point(x2, y1 + t),
          new Point(xc + t * 0.9, yc),
          new Point(x2, y2 - t),
          new Point(x2 - t, y2),
          new Point(xc, yc + t * 0.9),
          new Point(x1 + t, y2),
          new Point(x1, y2 - t),
          new Point(xc - t * 0.9, yc),
          new Point(x1, y1 + t),
        ]);
        canvas.restoreState();
      } else {
        canvas.polygon([
          new Point(x1, y1 + t),
          new Point(x1 + t, y1),
          new Point(xc, yc - t * 0.9),
          new Point(x2 - t, y1),
          new Point(x2, y1 + t),
          new Point(xc + t * 0.9, yc),
          new Point(x2, y2 - t),
          new Point(x2 - t, y2),
          new Point(xc, yc + t * 0.9),
          new Point(x1 + t, y2),
          new Point(x1, y2 - t),
          new Point(xc - t * 0.9, yc),
          new Point(x1, y1 + t),
        ]);
      }
    }
    if (isCompensate && !isMultiple) {
      const s = w * 0.1;
      if (isEnd || isIntermediateThrowing) {
        canvas.storeState();
        canvas.fillColor = this.lineColor;
        canvas.fillPolygon([
          new Point(x1 - s, yc),
          new Point(xc - s, y1),
          new Point(xc - s, y2),
          new Point(x1 - s, yc),
        ]);
        canvas.fillPolygon([
          new Point(xc - s, yc),
          new Point(x2 - s, y1),
          new Point(x2 - s, y2),
          new Point(xc - s, yc),
        ]);
        canvas.restoreState();
      } else {
        canvas.polygon([
          new Point(x1 - s, yc),
          new Point(xc - s, y1),
          new Point(xc - s, y2),
          new Point(x1 - s, yc),
        ]);
        canvas.polygon([
          new Point(xc - s, yc),
          new Point(x2 - s, y1),
          new Point(x2 - s, y2),
          new Point(xc - s, yc),
        ]);
      }
    }
    if (isConditional && !isMultiple) {
      const s = w * 0.1;
      canvas.rect(x1, y1, x2, y2);
      canvas.line(
        x1 + s,
        y1 + Math.round(w * 0.3),
        x2 - s,
        y1 + Math.round(w * 0.3),
      );
      canvas.line(x1 + s, yc, x2 - s, yc);
      canvas.line(
        x1 + s,
        y2 - Math.round(w * 0.3),
        x2 - s,
        y2 - Math.round(w * 0.3),
      );
    }
    if (isLink && !isMultiple) {
      const t = Math.round(w * 0.3);
      if (isEnd || isIntermediateThrowing) {
        canvas.storeState();
        canvas.fillColor = this.lineColor;
        canvas.fillPolygon([
          new Point(x1, yc - t),
          new Point(x2 - t, yc - t),
          new Point(x2 - t, y1),
          new Point(x2, yc),
          new Point(x2 - t, y2),
          new Point(x2 - t, yc + t),
          new Point(x1, yc + t),
          new Point(x1, yc - t),
        ]);
        canvas.restoreState();
      } else {
        canvas.polygon([
          new Point(x1, yc - t),
          new Point(x2 - t, yc - t),
          new Point(x2 - t, y1),
          new Point(x2, yc),
          new Point(x2 - t, y2),
          new Point(x2 - t, yc + t),
          new Point(x1, yc + t),
          new Point(x1, yc - t),
        ]);
      }
    }
    if (isSignal && !isMultiple) {
      const t = Math.round(w * 0.1);
      if (isEnd || isIntermediateThrowing) {
        canvas.storeState();
        canvas.fillColor = this.lineColor;
        canvas.fillPolygon([
          new Point(xc, y1),
          new Point(x2, y2 - t),
          new Point(x1, y2 - t),
          new Point(xc, y1 + t),
        ]);
        canvas.restoreState();
      } else {
        canvas.polygon([
          new Point(xc, y1),
          new Point(x2, y2 - t),
          new Point(x1, y2 - t),
          new Point(xc, y1 + t),
        ]);
      }
    }
    if (isTerminate && !isMultiple) {
      canvas.storeState();
      canvas.fillColor = this.lineColor;
      canvas.fillEllipse(x1, y1, x2, y2);
      canvas.restoreState();
    }
    if (isMultiple && !this.model.parallelMultiple) {
      const yt1 = Math.round(w * 0.35);
      const yt2 = Math.round(w * 0.1);
      const xt1 = Math.round(w * 0.25);
      if (isEnd || isIntermediateThrowing) {
        canvas.storeState();
        canvas.fillColor = this.lineColor;
        canvas.fillPolygon([
          new Point(xc, y1),
          new Point(x2, y1 + yt1),
          new Point(x2 - xt1, y2 - yt2),
          new Point(x1 + xt1, y2 - yt2),
          new Point(x1, y1 + yt1),
          new Point(xc, y1),
        ]);
        canvas.restoreState();
      } else {
        canvas.polygon([
          new Point(xc, y1),
          new Point(x2, y1 + yt1),
          new Point(x2 - xt1, y2 - yt2),
          new Point(x1 + xt1, y2 - yt2),
          new Point(x1, y1 + yt1),
          new Point(xc, y1),
        ]);
      }
    }
    if (isMultiple && this.model.parallelMultiple) {
      const t = w * 0.15;
      canvas.polygon([
        new Point(xc - t, y1),
        new Point(xc + t, y1),
        new Point(xc + t, yc - t),
        new Point(x2, yc - t),
        new Point(x2, yc + t),
        new Point(xc + t, yc + t),
        new Point(xc + t, y2),
        new Point(xc - t, y2),
        new Point(xc - t, yc + t),
        new Point(x1, yc + t),
        new Point(x1, yc - t),
        new Point(xc - t, yc - t),
        new Point(xc - t, y1),
      ]);
    }
  }

  drawShadow(canvas) {
    canvas.storeState();
    canvas.alpha = SHADOW_ALPHA;
    canvas.fillColor = SHADOW_COLOR;
    canvas.fillEllipse(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      ACTIVITY_ROUND,
    );
    canvas.restoreState();
  }
}

/**
 * BPMNMessageView
 */
class BPMNMessageView extends BPMNFloatingNodeView {
  constructor() {
    super();
    this.containerChangeable = true;
    this.sizable = NodeView.SZ_RATIO;
    this.fillColor =
      app.preferences.get("bpmn.message.fillColor", "#ffffff") ||
      app.preferences.get("view.fillColor", "#ffffff");
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = MESSAGE_MINWIDTH;
    this.minHeight = MESSAGE_MINHEIGHT;
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);
    /*
    for (var i = 0, len = this.getDiagram().ownedViews.length; i < len; i++) {
      const v = this.getDiagram().ownedViews[i]
      if (v instanceof BPMNMessageFlowView && v.model.messageRef === this.model) {
        this.left = v.points.points[0].x
        this.top = v.points.points[0].y
      }
    }
    */
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    const xc = Math.round((this.left + this.getRight()) / 2);
    const yc = Math.round((this.top + this.getBottom()) / 2);
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
    canvas.line(this.left, this.top, xc, yc);
    canvas.line(xc, yc, this.getRight(), this.top);
  }

  drawShadow(canvas) {
    canvas.storeState();
    canvas.alpha = SHADOW_ALPHA;
    canvas.fillColor = SHADOW_COLOR;
    canvas.fillRect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      6,
    );
    canvas.restoreState();
  }
}

/**
 * BPMNConversationView
 */
class BPMNConversationView extends BPMNFloatingNodeView {
  constructor() {
    super();
    this.containerChangeable = true;
    this.sizable = NodeView.SZ_RATIO;
    this.fillColor =
      app.preferences.get("bpmn.conversation.fillColor", "#ffffff") ||
      app.preferences.get("view.fillColor", "#ffffff");
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = CONVERSATION_MINWIDTH;
    this.minHeight = CONVERSATION_MINHEIGHT;
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    const xc = Math.round((this.left + this.getRight()) / 2);
    const yc = Math.round((this.top + this.getBottom()) / 2);
    const g = this.width * 0.25;
    if (this.model instanceof BPMNCallConversation) {
      canvas.lineWidth = 3;
    }
    canvas.fillPolygon([
      new Point(this.left + g, this.top),
      new Point(this.getRight() - g, this.top),
      new Point(this.getRight(), yc),
      new Point(this.getRight() - g, this.getBottom()),
      new Point(this.left + g, this.getBottom()),
      new Point(this.left, yc),
      new Point(this.left + g, this.top),
    ]);
    canvas.polygon([
      new Point(this.left + g, this.top),
      new Point(this.getRight() - g, this.top),
      new Point(this.getRight(), yc),
      new Point(this.getRight() - g, this.getBottom()),
      new Point(this.left + g, this.getBottom()),
      new Point(this.left, yc),
      new Point(this.left + g, this.top),
    ]);
    canvas.lineWidth = 1;
    if (
      this.model instanceof BPMNSubConversation ||
      (this.model instanceof BPMNCallConversation &&
        this.model.calledRef instanceof BPMNCollaboration)
    ) {
      canvas.rect(xc - 6, this.getBottom() - 15, xc + 6, this.getBottom() - 3);
      canvas.line(xc - 4, this.getBottom() - 9, xc + 4, this.getBottom() - 9);
      canvas.line(xc, this.getBottom() - 13, xc, this.getBottom() - 5);
    }
  }
}

/**
 * BPMNConversationLinkView
 */
class BPMNConversationLinkView extends EdgeView {
  constructor() {
    super();
    this.lineStyle =
      app.preferences.get(
        "bpmn.conversation-link.lineStyle",
        EdgeView.LS_ROUNDRECT,
      ) || app.preferences.get("view.lineStyle", EdgeView.LS_OBLIQUE);
    this.tailEndStyle = EdgeView.ES_FLAT;
    this.headEndStyle = EdgeView.ES_FLAT;
  }

  drawObject(canvas) {
    canvas.lineWidth = 3;
    super.drawObject(canvas);
    canvas.lineWidth = 1;
  }
}

/**
 * BPMNGatewayView
 */
class BPMNGatewayView extends BPMNFloatingNodeView {
  constructor() {
    super();
    this.containerChangeable = true;
    this.sizable = NodeView.SZ_RATIO;
    this.fillColor =
      app.preferences.get("bpmn.gateway.fillColor", "#ffffff") ||
      app.preferences.get("view.fillColor", "#ffffff");
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = GATEWAY_MINWIDTH;
    this.minHeight = GATEWAY_MINHEIGHT;
  }

  arrange(canvas) {
    /*
    if (this.containerView) {
      var r = this.containerView.getBoundingBox(canvas)
      var c = Coord.getCenter(new Rect(this.left, this.top, this.getRight(), this.getBottom()))
      var p = this._junction2(r, c)
      this.left = p.x - PORT_MINWIDTH / 2
      this.top = p.y - PORT_MINHEIGHT / 2
      this.setRight(p.x + PORT_MINWIDTH / 2)
      this.setBottom(p.y + PORT_MINHEIGHT / 2)
    }
    */
    super.arrange(canvas);
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    const isInclusive = this.model instanceof BPMNInclusiveGateway;
    const isParallel = this.model instanceof BPMNParallelGateway;
    const isComplex = this.model instanceof BPMNComplexGateway;
    const isEventBased = this.model instanceof BPMNEventBasedGateway;
    const x = (this.left + this.getRight()) / 2;
    const y = (this.top + this.getBottom()) / 2;
    const g = this.width / 4;
    const x1 = x - g;
    const y1 = y - g;
    const x2 = x + g;
    const y2 = y + g;
    canvas.fillPolygon([
      new Point(this.left, y),
      new Point(x, this.top),
      new Point(this.getRight(), y),
      new Point(x, this.getBottom()),
      new Point(this.left, y),
    ]);
    canvas.polygon([
      new Point(this.left, y),
      new Point(x, this.top),
      new Point(this.getRight(), y),
      new Point(x, this.getBottom()),
      new Point(this.left, y),
    ]);
    if (isInclusive) {
      canvas.lineWidth = 3;
      canvas.ellipse(x1, y1, x2, y2);
      canvas.lineWidth = 1;
    }
    if (isParallel) {
      canvas.lineWidth = 3;
      canvas.line(x, y1, x, y2);
      canvas.line(x1, y, x2, y);
      canvas.lineWidth = 1;
    }
    if (isComplex) {
      canvas.lineWidth = 3;
      canvas.line(x, y1, x, y2);
      canvas.line(x1, y, x2, y);
      canvas.line(x1 + g * 0.3, y1 + g * 0.3, x2 - g * 0.3, y2 - g * 0.3);
      canvas.line(x2 - g * 0.3, y1 + g * 0.3, x1 + g * 0.3, y2 - g * 0.3);
      canvas.lineWidth = 1;
    }
    if (isEventBased) {
      const yt1 = Math.round(g * 2 * 0.35);
      const yt2 = Math.round(g * 2 * 0.1);
      const xt1 = Math.round(g * 2 * 0.25);
      canvas.ellipse(
        x1 - g * 0.25,
        y1 - g * 0.25,
        x2 + g * 0.25,
        y2 + g * 0.25,
      );
      if (!this.model.instantiate) canvas.ellipse(x1, y1, x2, y2);
      if (
        this.model.eventGatewayType === BPMNEventBasedGateway.EGT_PARALLEL &&
        this.model.instantiate
      ) {
        const t = g * 2 * 0.15;
        canvas.polygon([
          new Point(x - t, y1),
          new Point(x + t, y1),
          new Point(x + t, y - t),
          new Point(x2, y - t),
          new Point(x2, y + t),
          new Point(x + t, y + t),
          new Point(x + t, y2),
          new Point(x - t, y2),
          new Point(x - t, y + t),
          new Point(x1, y + t),
          new Point(x1, y - t),
          new Point(x - t, y - t),
          new Point(x - t, y1),
        ]);
      } else {
        canvas.polygon([
          new Point(x, y1),
          new Point(x2, y1 + yt1),
          new Point(x2 - xt1, y2 - yt2),
          new Point(x1 + xt1, y2 - yt2),
          new Point(x1, y1 + yt1),
          new Point(x, y1),
        ]);
      }
    }
  }

  drawShadow(canvas) {
    canvas.storeState();
    canvas.alpha = SHADOW_ALPHA;
    canvas.fillColor = SHADOW_COLOR;
    const x = (this.left + this.getRight()) / 2;
    const y = (this.top + this.getBottom()) / 2;
    canvas.fillPolygon([
      new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET),
      new Point(x + SHADOW_OFFSET, this.top + SHADOW_OFFSET),
      new Point(this.getRight() + SHADOW_OFFSET, y + SHADOW_OFFSET),
      new Point(x + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET),
      new Point(this.left + SHADOW_OFFSET, y + SHADOW_OFFSET),
    ]);
    canvas.restoreState();
  }
}

/**
 * BPMNDataObjectView
 */
class BPMNDataObjectView extends BPMNFloatingNodeView {
  constructor() {
    super();
    this.containerChangeable = true;
    this.sizable = NodeView.SZ_RATIO;
    this.fillColor =
      app.preferences.get("bpmn.dataobject.fillColor", "#ffffff") ||
      app.preferences.get("view.fillColor", "#ffffff");
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = DATAOBJECT_MINWIDTH;
    this.minHeight = DATAOBJECT_MINHEIGHT;
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    const rect = new Rect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
    );
    var w = rect.x2 - rect.x1;
    // var h = rect.y2 - rect.y1
    var x = rect.x2 - (w * 30) / 100;
    var y = rect.y1 + (w * 30) / 100;
    canvas.fillPolygon([
      new Point(rect.x1, rect.y1),
      new Point(x, rect.y1),
      new Point(rect.x2, y),
      new Point(rect.x2, rect.y2),
      new Point(rect.x1, rect.y2),
    ]);
    canvas.polygon([
      new Point(rect.x1, rect.y1),
      new Point(x, rect.y1),
      new Point(rect.x2, y),
      new Point(rect.x2, rect.y2),
      new Point(rect.x1, rect.y2),
    ]);
    canvas.polygon([
      new Point(x, rect.y1),
      new Point(x, y),
      new Point(rect.x2, y),
    ]);

    const xc = Math.round((this.left + this.getRight()) / 2);
    if (this.model.isCollection) {
      canvas.line(xc - 3, this.getBottom() - 3, xc - 3, this.getBottom() - 12);
      canvas.line(xc, this.getBottom() - 3, xc, this.getBottom() - 12);
      canvas.line(xc + 3, this.getBottom() - 3, xc + 3, this.getBottom() - 12);
    }
  }

  drawShadow(canvas) {
    canvas.storeState();
    canvas.alpha = SHADOW_ALPHA;
    canvas.fillColor = SHADOW_COLOR;
    const rect = new Rect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
    );
    var w = rect.x2 - rect.x1;
    // var h = rect.y2 - rect.y1
    var x = rect.x2 - (w * 30) / 100;
    var y = rect.y1 + (w * 30) / 100;
    canvas.fillPolygon([
      new Point(rect.x1, rect.y1),
      new Point(x, rect.y1),
      new Point(rect.x2, y),
      new Point(rect.x2, rect.y2),
      new Point(rect.x1, rect.y2),
    ]);
    canvas.restoreState();
  }
}

/**
 * BPMNDataInputView
 */
class BPMNDataInputView extends BPMNDataObjectView {
  drawObject(canvas) {
    super.drawObject(canvas);
    const w = this.width;
    const x1 = this.left + 3;
    const y1 = this.top + 3;
    const x2 = this.left + Math.round(w * 0.6);
    const y2 = this.top + Math.round(w * 0.6);
    // const xc = Math.round((x1 + x2) / 2)
    const yc = Math.round((y1 + y2) / 2);
    const t = Math.round(w * 0.12);
    canvas.polygon([
      new Point(x1, yc - t),
      new Point(x2 - t, yc - t),
      new Point(x2 - t, y1),
      new Point(x2, yc),
      new Point(x2 - t, y2),
      new Point(x2 - t, yc + t),
      new Point(x1, yc + t),
      new Point(x1, yc - t),
    ]);
  }
}

/**
 * BPMNDataOutputView
 */
class BPMNDataOutputView extends BPMNDataObjectView {
  drawObject(canvas) {
    super.drawObject(canvas);
    canvas.storeState();
    canvas.fillColor = this.lineColor;
    const w = this.width;
    const x1 = this.left + 3;
    const y1 = this.top + 3;
    const x2 = this.left + Math.round(w * 0.6);
    const y2 = this.top + Math.round(w * 0.6);
    // const xc = Math.round((x1 + x2) / 2)
    const yc = Math.round((y1 + y2) / 2);
    const t = Math.round(w * 0.12);
    canvas.fillPolygon([
      new Point(x1, yc - t),
      new Point(x2 - t, yc - t),
      new Point(x2 - t, y1),
      new Point(x2, yc),
      new Point(x2 - t, y2),
      new Point(x2 - t, yc + t),
      new Point(x1, yc + t),
      new Point(x1, yc - t),
    ]);
    canvas.restoreState();
  }
}

/**
 * BPMNDataStoreView
 */
class BPMNDataStoreView extends BPMNGeneralNodeView {
  constructor() {
    super();
    this.containerChangeable = true;
    this.sizable = NodeView.SZ_RATIO;
    this.fillColor =
      app.preferences.get("bpmn.dataobject.fillColor", "#ffffff") ||
      app.preferences.get("view.fillColor", "#ffffff");
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = DATAOBJECT_MINWIDTH;
    this.minHeight = DATAOBJECT_MINHEIGHT;
  }

  drawObject(canvas) {
    // super.drawObject(canvas)
    let r = new Rect(this.left, this.top, this.getRight(), this.getBottom());
    let w = r.getWidth();
    let h = r.getHeight();
    let xm = (r.x1 + r.x2) / 2;
    let g = Math.floor(h / 8);
    let kappa = 0.5522848;
    let ox = (w / 2) * kappa; // control point offset horizontal
    let oy = g * kappa; // control point offset vertical
    canvas.fillPath(
      [
        ["M", r.x1, r.y1 + g],
        ["C", r.x1, r.y1 + g - oy, xm - ox, r.y1, xm, r.y1],
        ["C", xm + ox, r.y1, r.x2, r.y1 + g - oy, r.x2, r.y1 + g],
        ["L", r.x2, r.y2 - g],
        ["C", r.x2, r.y2 - g + oy, xm + ox, r.y2, xm, r.y2],
        ["C", xm - ox, r.y2, r.x1, r.y2 - g + oy, r.x1, r.y2 - g],
        ["L", r.x1, r.y1 + g],
        ["Z"],
      ],
      true,
    );
    canvas.path([
      ["M", r.x1, r.y1 + g],
      ["C", r.x1, r.y1 + g + oy, xm - ox, r.y1 + g * 2, xm, r.y1 + g * 2],
      ["C", xm + ox, r.y1 + g * 2, r.x2, r.y1 + g + oy, r.x2, r.y1 + g],
    ]);
  }

  drawShadow(canvas) {
    canvas.storeState();
    canvas.alpha = SHADOW_ALPHA;
    canvas.fillColor = SHADOW_COLOR;
    let r = new Rect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
    );
    let w = r.getWidth();
    let h = r.getHeight();
    let xm = (r.x1 + r.x2) / 2;
    let g = Math.floor(h / 8);
    let kappa = 0.5522848;
    let ox = (w / 2) * kappa; // control point offset horizontal
    let oy = g * kappa; // control point offset vertical
    canvas.fillPath(
      [
        ["M", r.x1, r.y1 + g],
        ["C", r.x1, r.y1 + g - oy, xm - ox, r.y1, xm, r.y1],
        ["C", xm + ox, r.y1, r.x2, r.y1 + g - oy, r.x2, r.y1 + g],
        ["L", r.x2, r.y2 - g],
        ["C", r.x2, r.y2 - g + oy, xm + ox, r.y2, xm, r.y2],
        ["C", xm - ox, r.y2, r.x1, r.y2 - g + oy, r.x1, r.y2 - g],
        ["L", r.x1, r.y1 + g],
        ["Z"],
      ],
      false,
    );
    canvas.restoreState();
  }
}

/**
 * BPMNTextAnnotationView
 */
class BPMNTextAnnotationView extends NodeView {
  constructor() {
    super();

    /** @member {boolean} */
    this.wordWrap = true;

    /** @member {number} */
    this.horzAlign = Canvas.AL_LEFT;

    /** @member {number} */
    this.vertAlign = Canvas.AL_TOP;

    /* transient */
    this._rightPadding = 0;
  }

  sizeObject(canvas) {
    var marg, minW, minH, w, h;
    var lines = null;
    if (this.model.text && this.model.text.length > 0) {
      lines = this.model.text.split("\n");
    }
    w = 0;
    h = 0;
    if (lines !== null && lines.length > 0) {
      for (var i = 0, len = lines.length; i < len; i++) {
        if (this.wordWrap) {
          marg =
            COMPARTMENT_LEFT_PADDING +
            COMPARTMENT_RIGHT_PADDING +
            this._rightPadding;
          minW = canvas.textExtent(lines[i], 1).x;
          minH = canvas.textExtent(lines[i], this.width - marg).y;
          w = Math.max(w, minW);
          h = h + minH + 2;
        } else {
          var sz = canvas.textExtent(lines[i]);
          w = Math.max(w, sz.x);
          h = h + canvas.textExtent("^_").y + 2;
        }
      }
    }
    w +=
      COMPARTMENT_LEFT_PADDING + COMPARTMENT_RIGHT_PADDING + this._rightPadding;
    h += COMPARTMENT_TOP_PADDING + COMPARTMENT_BOTTOM_PADDING;
    this.minWidth = Math.max(TEXTANNOTATION_MINWIDTH, w);
    this.minHeight = Math.max(TEXTANNOTATION_MINHEIGHT, h);
    super.sizeObject(canvas);
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    if (this.model.text && this.model.text.length > 0) {
      var lines = this.model.text.split("\n");
      var x1 = this.left + COMPARTMENT_LEFT_PADDING;
      var x2 = this.getRight() - COMPARTMENT_RIGHT_PADDING;
      // var _h = canvas.textExtent('^_').y * lines.length
      var _h =
        this.minHeight - COMPARTMENT_TOP_PADDING - COMPARTMENT_BOTTOM_PADDING;
      var y = 0;
      switch (this.vertAlign) {
        case Canvas.AL_TOP:
          y = this.top + COMPARTMENT_TOP_PADDING;
          break;
        case Canvas.AL_MIDDLE:
          y = this.top + Math.round((this.height - _h) / 2);
          break;
        case Canvas.AL_BOTTOM:
          y = this.getBottom() - COMPARTMENT_BOTTOM_PADDING - _h;
          break;
      }
      for (var i = 0, len = lines.length; i < len; i++) {
        var sz = canvas.textExtent(lines[i], this.width - 1);
        var r = new Rect(x1, y, x2, y + sz.y + 2);
        canvas.textOut2(
          r,
          lines[i],
          this.horzAlign,
          Canvas.AL_TOP,
          false,
          this.wordWrap,
        );
        y = y + sz.y + 2;
      }
    }
    canvas.polyline([
      new Point(this.left + 10, this.top),
      new Point(this.left, this.top),
      new Point(this.left, this.getBottom()),
      new Point(this.left + 10, this.getBottom()),
    ]);
  }
}

/**
 * BPMNGroupView
 */
class BPMNGroupView extends NodeView {
  drawObject(canvas) {
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom());
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom(), [3, 3]);
  }
}

/**
 * BPMNAssociationView
 */
class BPMNAssociationView extends EdgeView {
  constructor() {
    super();
    this.tailEndStyle = EdgeView.ES_FLAT;
    this.headEndStyle = EdgeView.ES_FLAT;
    this.lineMode = EdgeView.LM_DOT;
  }

  update(canvas) {
    if (this.model) {
      if (this.model.associationDirection === BPMNAssociation.AD_ONE) {
        this.tailEndStyle = EdgeView.ES_FLAT;
        this.headEndStyle = EdgeView.ES_STICK_ARROW;
      } else if (this.model.associationDirection === BPMNAssociation.AD_BOTH) {
        this.tailEndStyle = EdgeView.ES_STICK_ARROW;
        this.headEndStyle = EdgeView.ES_STICK_ARROW;
      } else {
        this.tailEndStyle = EdgeView.ES_FLAT;
        this.headEndStyle = EdgeView.ES_FLAT;
      }
    }
    super.update(canvas);
  }
}

/**
 * BPMNDataAssociationView
 */
class BPMNDataAssociationView extends EdgeView {
  constructor() {
    super();
    this.tailEndStyle = EdgeView.ES_FLAT;
    this.headEndStyle = EdgeView.ES_STICK_ARROW;
    this.lineMode = EdgeView.LM_DOT;
  }
}

/**
 * BPMNMessageLinkView
 */
class BPMNMessageLinkView extends EdgeView {
  constructor() {
    super();
    this.tailEndStyle = EdgeView.ES_FLAT;
    this.headEndStyle = EdgeView.ES_FLAT;
    this.lineMode = EdgeView.LM_DOT;
  }
}

/**
 * BPMNSequenceFlowView
 */
class BPMNSequenceFlowView extends BPMNGeneralEdgeView {
  constructor() {
    super();
    this.lineStyle =
      app.preferences.get(
        "bpmn.sequence-flow.lineStyle",
        EdgeView.LS_ROUNDRECT,
      ) || app.preferences.get("view.lineStyle", EdgeView.LS_OBLIQUE);
  }

  update(canvas) {
    super.update(canvas);
    this.tailEndStyle = EdgeView.ES_FLAT;
    if (
      this.model.source instanceof BPMNGateway &&
      this.model.source.default === this.model
    ) {
      this.tailEndStyle = EdgeView.ES_SLASH;
    }
    if (
      this.model.source instanceof BPMNActivity &&
      this.model.condition.length > 0
    ) {
      this.tailEndStyle = EdgeView.ES_DIAMOND;
    }
  }
}

/**
 * BPMNMessageFlowView
 */
class BPMNMessageFlowView extends BPMNGeneralEdgeView {
  constructor() {
    super();
    this.lineStyle =
      app.preferences.get(
        "bpmn.message-flow.lineStyle",
        EdgeView.LS_ROUNDRECT,
      ) || app.preferences.get("view.lineStyle", EdgeView.LS_OBLIQUE);
    this.tailEndStyle = EdgeView.ES_SMALL_CIRCLE;
    this.headEndStyle = EdgeView.ES_BLANK_ARROW;
    this.lineMode = EdgeView.LM_DASH;
  }
}

/**
 * BPMNPoolView
 */
class BPMNPoolView extends NodeView {
  constructor() {
    super();
    this.containerChangeable = true;

    /** @member {LabelView} */
    this.nameLabel = new LabelView();
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER;
    this.nameLabel.verticalAlignment = Canvas.AL_TOP;
    this.nameLabel.selectable = View.SK_NO;
    this.nameLabel.parentStyle = true;
    this.addSubView(this.nameLabel);

    /** @member {boolean} */
    this.isVertical = false;
  }

  update(canvas) {
    super.update(canvas);
    if (this.model) {
      this.nameLabel.text = this.model.name;
    }
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    if (this.isVertical) {
      const nw = LEFT_PADDING + this.nameLabel.minWidth + RIGHT_PADDING;
      const nh = TOP_PADDING + this.nameLabel.minHeight + BOTTOM_PADDING;
      let sw = 0;
      let sh = 0;
      this.containedViews.forEach((v) => {
        sh = Math.max(sh, v.height);
        sw = Math.max(sw, v.minWidth);
      });
      this.minWidth = Math.max(nw, sw);
      this.minHeight = Math.max(nh, sh);
    } else {
      const nw = TOP_PADDING + this.nameLabel.minWidth + BOTTOM_PADDING;
      const nh = TOP_PADDING + this.nameLabel.minHeight + BOTTOM_PADDING;
      let sw = 0;
      let sh = 0;
      this.containedViews.forEach((v) => {
        sh = Math.max(sh, v.height);
        sw = Math.max(sw, v.minWidth);
      });
      this.minWidth = nw + sw;
      this.minHeight = Math.max(nh, sh);
    }
    this.sizeConstraints();
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);

    // name label
    if (this.isVertical) {
      this.nameLabel.width = this.nameLabel.minWidth;
      this.nameLabel.height = this.nameLabel.minHeight;
      this.nameLabel.left = this.left;
      this.nameLabel.top = this.top + TOP_PADDING;
      this.nameLabel.setRight(this.getRight());
    } else {
      this.nameLabel.direction = LabelView.DK_VERT;
      this.nameLabel.width = this.nameLabel.minWidth;
      this.nameLabel.height = this.nameLabel.minHeight;
      this.nameLabel.left = this.left + LEFT_PADDING;
      this.nameLabel.top = this.top;
      this.nameLabel.setBottom(this.getBottom());
    }

    // arrange lanes
    if (this.isVertical) {
      let vs = this.containedViews.filter((v) => v instanceof BPMNLaneView);
      vs.sort((a, b) => a.left - b.left);
      let x = this.left;
      for (let i = 0; i < vs.length; i++) {
        let v = vs[i];
        v.left = x;
        v.top = this.nameLabel.getBottom() + BOTTOM_PADDING;
        v.setBottom(this.getBottom());
        x += v.width;
      }
    } else {
      let vs = this.containedViews.filter((v) => v instanceof BPMNLaneView);
      vs.sort((a, b) => a.top - b.top);
      let y = this.top;
      for (let i = 0; i < vs.length; i++) {
        let v = vs[i];
        v.top = y;
        v.left = this.nameLabel.getRight() + RIGHT_PADDING;
        v.setRight(this.getRight());
        y += v.height;
      }
    }
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    canvas.rect(this.left, this.top, this.right, this.bottom);
    if (this.isVertical) {
      canvas.line(
        this.left,
        this.nameLabel.getBottom() + BOTTOM_PADDING,
        this.getRight(),
        this.nameLabel.getBottom() + BOTTOM_PADDING,
      );
    } else {
      canvas.line(
        this.nameLabel.getRight() + RIGHT_PADDING,
        this.top,
        this.nameLabel.getRight() + RIGHT_PADDING,
        this.bottom,
      );
    }
    const mx = Math.round((this.left + this.getRight()) / 2);
    if (this.model.maximum > 1) {
      canvas.line(mx, this.getBottom() - 14, mx, this.getBottom() - 4);
      canvas.line(mx - 4, this.getBottom() - 14, mx - 4, this.getBottom() - 4);
      canvas.line(mx + 4, this.getBottom() - 14, mx + 4, this.getBottom() - 4);
    }
  }

  canContainViewKind(kind) {
    return (
      app.metamodels.isKindOf(kind, "BPMNLaneView") ||
      app.metamodels.isKindOf(kind, "BPMNSubProcessView") ||
      app.metamodels.isKindOf(kind, "BPMNTaskView") ||
      app.metamodels.isKindOf(kind, "BPMNEventView") ||
      app.metamodels.isKindOf(kind, "BPMNGatewayView") ||
      app.metamodels.isKindOf(kind, "BPMNDataObjectView") ||
      app.metamodels.isKindOf(kind, "BPMNDataStoreView")
    );
  }

  /** Cannnot be deleted view only. */
  canDelete() {
    return false;
  }
}

/**
 * BPMNLaneView
 */
class BPMNLaneView extends NodeView {
  constructor() {
    super();
    this.containerChangeable = true;

    /** @member {LabelView} */
    this.nameLabel = new LabelView();
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER;
    this.nameLabel.verticalAlignment = Canvas.AL_TOP;
    this.nameLabel.selectable = View.SK_NO;
    this.nameLabel.parentStyle = true;
    this.addSubView(this.nameLabel);

    /** @member {boolean} */
    this.isVertical = false;
  }

  update(canvas) {
    super.update(canvas);
    if (this.model) {
      this.nameLabel.text = this.model.name;
    }
    if (this.containerView instanceof BPMNPoolView) {
      this.isVertical = this.containerView.isVertical;
    }
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    if (this.isVertical) {
      const nw = LEFT_PADDING + this.nameLabel.minWidth + RIGHT_PADDING;
      const nh = TOP_PADDING + this.nameLabel.minHeight + BOTTOM_PADDING;
      let sw = 0;
      let sh = 0;
      this.containedViews.forEach((v) => {
        sh = Math.max(sh, v.height);
        sw = Math.max(sw, v.minWidth);
      });
      this.minWidth = Math.max(nw, sw);
      this.minHeight = nh + sh;
    } else {
      const nw = TOP_PADDING + this.nameLabel.minWidth + BOTTOM_PADDING;
      const nh = TOP_PADDING + this.nameLabel.minHeight + BOTTOM_PADDING;
      let sw = 0;
      let sh = 0;
      this.containedViews.forEach((v) => {
        sh = Math.max(sh, v.minHeight);
        sw = Math.max(sw, v.minWidth);
      });
      this.minWidth = nw + sw;
      this.minHeight = Math.max(nh, TOP_PADDING + sh + BOTTOM_PADDING);
    }
    this.sizeConstraints();
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);
    // name label
    if (this.isVertical) {
      this.nameLabel.width = this.nameLabel.minWidth;
      this.nameLabel.height = this.nameLabel.minHeight;
      this.nameLabel.left = this.left;
      this.nameLabel.top = this.top + TOP_PADDING;
      this.nameLabel.setRight(this.getRight());
    } else {
      this.nameLabel.direction = LabelView.DK_VERT;
      this.nameLabel.width = this.nameLabel.minWidth;
      this.nameLabel.height = this.nameLabel.minHeight;
      this.nameLabel.left = this.left + LEFT_PADDING;
      this.nameLabel.top = this.top;
      this.nameLabel.setBottom(this.getBottom());
    }
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    if (this.isVertical) {
      canvas.line(this.right, this.top, this.right, this.bottom);
    } else {
      canvas.line(this.left, this.bottom, this.right, this.bottom);
    }
  }

  /** Cannnot be deleted view only. */
  canDelete() {
    return false;
  }

  canContainViewKind(kind) {
    return (
      app.metamodels.isKindOf(kind, "BPMNTaskView") ||
      app.metamodels.isKindOf(kind, "BPMNSubProcessView") ||
      app.metamodels.isKindOf(kind, "BPMNEventView") ||
      app.metamodels.isKindOf(kind, "BPMNGatewayView") ||
      app.metamodels.isKindOf(kind, "BPMNDataObjectView") ||
      app.metamodels.isKindOf(kind, "BPMNDataStoreView")
    );
  }
}

// diagram
type.BPMNDiagram = BPMNDiagram;

// model elements
type.BPMNBaseElement = BPMNBaseElement;
type.BPMNRootElement = BPMNRootElement;
type.BPMNCollaboration = BPMNCollaboration;
type.BPMNChoreography = BPMNChoreography;
type.BPMNGlobalConversation = BPMNGlobalConversation;
type.BPMNParticipant = BPMNParticipant;
type.BPMNLane = BPMNLane;
type.BPMNProcess = BPMNProcess;
type.BPMNFlowElement = BPMNFlowElement;

// activities
type.BPMNActivity = BPMNActivity;
type.BPMNCallActivity = BPMNCallActivity;
type.BPMNTask = BPMNTask;
type.BPMNSendTask = BPMNSendTask;
type.BPMNReceiveTask = BPMNReceiveTask;
type.BPMNServiceTask = BPMNServiceTask;
type.BPMNUserTask = BPMNUserTask;
type.BPMNManualTask = BPMNManualTask;
type.BPMNBusinessRuleTask = BPMNBusinessRuleTask;
type.BPMNScriptTask = BPMNScriptTask;
type.BPMNSubProcess = BPMNSubProcess;
type.BPMNAdHocSubProcess = BPMNAdHocSubProcess;
type.BPMNTransaction = BPMNTransaction;

// choreography
type.BPMNChoreographyActivity = BPMNChoreographyActivity;
type.BPMNChoreographyTask = BPMNChoreographyTask;
type.BPMNSubChoreography = BPMNSubChoreography;
type.BPMNCallChoreography = BPMNCallChoreography;

// events
type.BPMNEventDefinition = BPMNEventDefinition;
type.BPMNCompensateEventDefinition = BPMNCompensateEventDefinition;
type.BPMNCancelEventDefinition = BPMNCancelEventDefinition;
type.BPMNErrorEventDefinition = BPMNErrorEventDefinition;
type.BPMNLinkEventDefinition = BPMNLinkEventDefinition;
type.BPMNSignalEventDefinition = BPMNSignalEventDefinition;
type.BPMNTimerEventDefinition = BPMNTimerEventDefinition;
type.BPMNEscalationEventDefinition = BPMNEscalationEventDefinition;
type.BPMNMessageEventDefinition = BPMNMessageEventDefinition;
type.BPMNTerminateEventDefinition = BPMNTerminateEventDefinition;
type.BPMNConditionalEventDefinition = BPMNConditionalEventDefinition;
type.BPMNEvent = BPMNEvent;
type.BPMNThrowEvent = BPMNThrowEvent;
type.BPMNCatchEvent = BPMNCatchEvent;
type.BPMNImplicitThrowEvent = BPMNImplicitThrowEvent;
type.BPMNIntermediateThrowEvent = BPMNIntermediateThrowEvent;
type.BPMNEndEvent = BPMNEndEvent;
type.BPMNStartEvent = BPMNStartEvent;
type.BPMNIntermediateCatchEvent = BPMNIntermediateCatchEvent;
type.BPMNBoundaryEvent = BPMNBoundaryEvent;

// gateways
type.BPMNGateway = BPMNGateway;
type.BPMNExclusiveGateway = BPMNExclusiveGateway;
type.BPMNInclusiveGateway = BPMNInclusiveGateway;
type.BPMNParallelGateway = BPMNParallelGateway;
type.BPMNComplexGateway = BPMNComplexGateway;
type.BPMNEventBasedGateway = BPMNEventBasedGateway;

// data
type.BPMNItemAwareElement = BPMNItemAwareElement;
type.BPMNDataObject = BPMNDataObject;
type.BPMNDataStore = BPMNDataStore;
type.BPMNDataInput = BPMNDataInput;
type.BPMNDataOutput = BPMNDataOutput;

// message
type.BPMNMessage = BPMNMessage;

// conversations
type.BPMNConversationNode = BPMNConversationNode;
type.BPMNConversation = BPMNConversation;
type.BPMNSubConversation = BPMNSubConversation;
type.BPMNCallConversation = BPMNCallConversation;
type.BPMNConversationLink = BPMNConversationLink;

// artifacts
type.BPMNArtifact = BPMNArtifact;
type.BPMNTextAnnotation = BPMNTextAnnotation;
type.BPMNGroup = BPMNGroup;
type.BPMNAssociation = BPMNAssociation;
type.BPMNDataAssociation = BPMNDataAssociation;

// flows
type.BPMNSequenceFlow = BPMNSequenceFlow;
type.BPMNMessageFlow = BPMNMessageFlow;
type.BPMNMessageLink = BPMNMessageLink;

// view elements
type.BPMNGeneralNodeView = BPMNGeneralNodeView;
type.BPMNFloatingNodeView = BPMNFloatingNodeView;
type.BPMNGeneralEdgeView = BPMNGeneralEdgeView;
type.BPMNActivityView = BPMNActivityView;
type.BPMNCallActivityView = BPMNCallActivityView;
type.BPMNTaskView = BPMNTaskView;
type.BPMNSubProcessView = BPMNSubProcessView;
type.BPMNAdHocSubProcessView = BPMNAdHocSubProcessView;
type.BPMNTransactionView = BPMNTransactionView;
type.BPMNChoreographyActivityView = BPMNChoreographyActivityView;
type.BPMNChoreographyTaskView = BPMNChoreographyTaskView;
type.BPMNSubChoreographyView = BPMNSubChoreographyView;
type.BPMNEventView = BPMNEventView;
type.BPMNMessageView = BPMNMessageView;
type.BPMNConversationView = BPMNConversationView;
type.BPMNConversationLinkView = BPMNConversationLinkView;
type.BPMNGatewayView = BPMNGatewayView;
type.BPMNDataObjectView = BPMNDataObjectView;
type.BPMNDataInputView = BPMNDataInputView;
type.BPMNDataOutputView = BPMNDataOutputView;
type.BPMNDataStoreView = BPMNDataStoreView;
type.BPMNTextAnnotationView = BPMNTextAnnotationView;
type.BPMNGroupView = BPMNGroupView;
type.BPMNAssociationView = BPMNAssociationView;
type.BPMNDataAssociationView = BPMNDataAssociationView;
type.BPMNMessageLinkView = BPMNMessageLinkView;
type.BPMNSequenceFlowView = BPMNSequenceFlowView;
type.BPMNMessageFlowView = BPMNMessageFlowView;
type.BPMNPoolView = BPMNPoolView;
type.BPMNLaneView = BPMNLaneView;
