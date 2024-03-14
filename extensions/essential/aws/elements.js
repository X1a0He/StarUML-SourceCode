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

const {
  ExtensibleModel,
  DirectedRelationship,
  Diagram,
  NodeView,
  EdgeView,
  LabelView,
  NodeLabelView,
  Hyperlink,
  EdgeParasiticView,
  Canvas,
} = app.type;

const LEFT_PADDING = 10;
const RIGHT_PADDING = 10;
const TOP_PADDING = 10;
const BOTTOM_PADDING = 10;

const GROUP_ICON_WIDTH = 32;
const GROUP_ICON_HEIGHT = 32;

const ICON_MINWIDTH = 48;
const ICON_MINHEIGHT = 48;

const CALLOUT_MINWIDTH = 24;
const CALLOUT_MINHEIGHT = 24;

const AWS_COLOR_SQUID = "#232F3E";
const AWS_COLOR_GALAXY = "#8C4FFF";
// const AWS_COLOR_NEBULA = "#C925D1";
const AWS_COLOR_COSMOS = "#E7157B";
// const AWS_COLOR_MARS = "#DD344C";
const AWS_COLOR_SMILE = "#ED7100";
const AWS_COLOR_ENDOR = "#7AA116";
const AWS_COLOR_ORBIT = "#01A88D";

/**
 * Load and draw image of view
 */
function loadAndDrawImage(
  canvas,
  icon,
  basePath,
  file,
  left,
  top,
  width,
  height,
) {
  if (icon.state === 2) {
    // loaded
    canvas.drawImage(icon.img, left, top, width, height);
  } else if (icon.state === 0) {
    icon.state = 1;
    if (file.length > 0) {
      icon.img.src = `file://${path.join(basePath, file)}`;
    }
    icon.img.onload = () => {
      icon.state = 2;
      canvas.drawImage(icon.img, left, top, width, height);
    };
    icon.img.onerror = () => {
      icon.state = 4; // error
    };
  }
  if (file.length === 0 || icon.state === 4) {
    canvas.line(left, top, left + width, top + height);
    canvas.line(left + width, top, left, top + height);
    canvas.rect(left, top, left + width, top + height);
  }
}

/**
 * AWSElement
 */
class AWSElement extends ExtensibleModel {
  constructor() {
    super();

    /** @type {string} */
    this.icon = "";

    // indicate whether to popup icon selector when double clicked
    this.__hasIcon = false;
  }

  getDisplayClassName() {
    return this.getClassName();
  }
}

/**
 * AWSDiagram
 */
class AWSDiagram extends Diagram {
  canAcceptModel(model) {
    return (
      model instanceof Hyperlink ||
      model instanceof Diagram ||
      model instanceof type.AWSElement ||
      model instanceof type.AWSArrow
    );
  }
}

/**
 * AWSModel
 */
class AWSModel extends AWSElement {}

/**
 * AWSGroup
 */
class AWSGroup extends AWSElement {
  constructor() {
    super();
    this.icon = "AWS-Cloud.svg"; // default group
    this.__hasIcon = true;
    this.__assetBaseDir = "aws/group-icons";
  }

  canContainKind(kind) {
    return app.metamodels.isKindOf(kind, "AWSElement");
  }
}

/**
 * AWSGenericGroup
 */
class AWSGenericGroup extends AWSElement {
  constructor() {
    super();

    /** @type {boolean} */
    this.dashed = false;
  }

  canContainKind(kind) {
    return app.metamodels.isKindOf(kind, "AWSElement");
  }
}

/**
 * AWSAvailabilityZone
 */
class AWSAvailabilityZone extends AWSElement {
  canContainKind(kind) {
    return app.metamodels.isKindOf(kind, "AWSElement");
  }
}

/**
 * AWSSecurityGroup
 */
class AWSSecurityGroup extends AWSElement {
  canContainKind(kind) {
    return app.metamodels.isKindOf(kind, "AWSElement");
  }
}

/**
 * AWSService
 */
class AWSService extends AWSElement {
  constructor() {
    super();
    this.icon = "Amazon-EC2.svg"; // default service
    this.__hasIcon = true;
    this.__assetBaseDir = "aws/service-icons";
  }
}

/**
 * AWSResource
 */
class AWSResource extends AWSElement {
  constructor() {
    super();
    this.icon = "Amazon-EC2_Instance.svg"; // default resource
    this.__hasIcon = true;
    this.__assetBaseDir = "aws/resource-icons";
  }
}

/**
 * AWSGeneralResource
 */
class AWSGeneralResource extends AWSElement {
  constructor() {
    super();
    this.icon = "Users.svg"; // default general resource
    this.__hasIcon = true;
    this.__assetBaseDir = "aws/general-icons";
  }
}

/**
 * AWSCallout
 */
class AWSCallout extends AWSElement {
  constructor() {
    super();
    this.icon = "";
    this.__hasIcon = false;
    this.name = "1";
  }
}

/**
 * AWSArrow
 */
class AWSArrow extends DirectedRelationship {}

/* ---------------------------- View Elements ------------------------------- */

/**
 * AWSGeneralNodeView
 */
class AWSGeneralNodeView extends NodeView {
  constructor() {
    super();
    this.containerChangeable = true;

    /** @type {boolean} */
    this.wordWrap = true;

    /** @type {LabelView} */
    this.nameLabel = new LabelView();
    this.nameLabel.parentStyle = true;
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER;
    this.nameLabel.verticalAlignment = Canvas.AL_MIDDLE;
    this.addSubView(this.nameLabel);
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
    this.nameLabel.left = this.left + LEFT_PADDING;
    this.nameLabel.top = this.top + TOP_PADDING;
    this.nameLabel.width = this.width - (LEFT_PADDING + RIGHT_PADDING);
    this.nameLabel.height = this.nameLabel.minHeight;
  }

  drawObject(canvas) {
    super.drawObject(canvas);
  }

  canDelete() {
    return false;
  }
}

/**
 * AWSIconNodeView
 */
class AWSIconNodeView extends NodeView {
  constructor() {
    super();
    this.containerExtending = false;
    this.containerChangeable = true;
    this.sizable = NodeView.SZ_RATIO;

    /** @member {NodeLabelView} */
    this.nameLabel = new NodeLabelView();
    this.nameLabel.distance = 42;
    this.nameLabel.alpha = -2 * (Math.PI / 4);
    this.addSubView(this.nameLabel);

    this.__icon = {
      img: new Image(),
      state: 0, // 0 = not loaded, 1 = loading, 2 = loaded, 4 = error
    };
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = ICON_MINWIDTH;
    this.minHeight = ICON_MINHEIGHT;
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

  drawObject(canvas) {
    super.drawObject(canvas);
    const basePath = path.join(
      __dirname,
      `../../../resources/assets`,
      this.model.__assetBaseDir,
    );
    loadAndDrawImage(
      canvas,
      this.__icon,
      basePath,
      this.model.icon,
      this.left,
      this.top,
      this.width,
      this.height,
    );
  }
}

/**
 * AWSGeneralEdgeView
 */
class AWSGeneralEdgeView extends EdgeView {
  constructor() {
    super();
    this.tailEndStyle = EdgeView.ES_FLAT;
    this.headEndStyle = EdgeView.ES_SOLID_ARROW;
    this.lineMode = EdgeView.LM_SOLID;

    /** @member {EdgeLabelView} */
    this.nameLabel = new type.EdgeLabelView();
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

  canConnectTo(view) {
    return view.model instanceof AWSElement;
  }

  canDelete() {
    return false;
  }
}

/**
 * AWSGroupView
 */
class AWSGroupView extends AWSGeneralNodeView {
  constructor() {
    super();
    this.nameLabel.horizontalAlignment = Canvas.AL_LEFT;
    this.__icon = {
      img: new Image(),
      state: 0, // 0 = not loaded, 1 = loading, 2 = loaded, 4 = error
    };
    this.__pattern = [];
  }

  canContainViewKind(kind) {
    return (
      app.metamodels.isKindOf(kind, "AWSGeneralNodeView") ||
      app.metamodels.isKindOf(kind, "AWSIconNodeView")
    );
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);
    switch (this.model.icon) {
      case "Auto-Scaling-group.svg":
        this.nameLabel.left = this.left + LEFT_PADDING;
        this.nameLabel.top = this.top + GROUP_ICON_HEIGHT + TOP_PADDING;
        this.nameLabel.width = this.width - (LEFT_PADDING + RIGHT_PADDING);
        this.nameLabel.height = this.nameLabel.minHeight;
        this.nameLabel.horizontalAlignment = Canvas.AL_CENTER;
        break;
      default:
        this.nameLabel.left = this.left + GROUP_ICON_WIDTH + LEFT_PADDING;
        this.nameLabel.top = this.top;
        this.nameLabel.width =
          this.width - (GROUP_ICON_WIDTH + LEFT_PADDING + RIGHT_PADDING);
        this.nameLabel.height = GROUP_ICON_HEIGHT;
        this.nameLabel.horizontalAlignment = Canvas.AL_LEFT;
        break;
    }
  }

  update(canvas) {
    super.update(canvas);
    this.__pattern = [];
    switch (this.model.icon) {
      case "Region.svg":
        this.lineColor = AWS_COLOR_ORBIT;
        this.__pattern = [3, 3];
        break;
      case "Private-subnet.svg":
        this.lineColor = AWS_COLOR_ORBIT;
        break;
      case "EC2-instance-contents.svg":
      case "Spot-Fleet.svg":
      case "Elastic-Beanstalk-container.svg":
        this.lineColor = AWS_COLOR_SMILE;
        break;
      case "Auto-Scaling-group.svg":
        this.lineColor = AWS_COLOR_SMILE;
        this.__pattern = [3, 3];
        break;
      case "Virtual-private-cloud-(VPC).svg":
        this.lineColor = AWS_COLOR_GALAXY;
        break;
      case "Public-subnet.svg":
      case "AWS-IoT-Greengrass-Deployment.svg":
      case "AWS-IoT-Greengrass.svg":
        this.lineColor = AWS_COLOR_ENDOR;
        break;
      case "Server-contents.svg":
      case "Corporate-data-center.svg":
        this.lineColor = AWS_COLOR_SQUID;
        break;
      case "AWS-account.svg":
      case "AWS-Step-Functions-workflow.svg":
        this.lineColor = AWS_COLOR_COSMOS;
        break;
      default:
        this.lineColor = "#000000";
        this.__pattern = [];
        break;
    }
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    canvas.rect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      this.__pattern,
    );
    const basePath = path.join(
      __dirname,
      `../../../resources/assets`,
      this.model.__assetBaseDir,
    );
    switch (this.model.icon) {
      case "Auto-Scaling-group.svg":
        loadAndDrawImage(
          canvas,
          this.__icon,
          basePath,
          this.model.icon,
          this.left + this.width / 2 - GROUP_ICON_WIDTH / 2,
          this.top,
          GROUP_ICON_WIDTH,
          GROUP_ICON_HEIGHT,
        );
        break;
      default:
        loadAndDrawImage(
          canvas,
          this.__icon,
          basePath,
          this.model.icon,
          this.left,
          this.top,
          GROUP_ICON_WIDTH,
          GROUP_ICON_HEIGHT,
        );
        break;
    }
  }
}

/**
 * AWSGenericGroupView
 */
class AWSGenericGroupView extends AWSGeneralNodeView {
  canContainViewKind(kind) {
    return (
      app.metamodels.isKindOf(kind, "AWSGeneralNodeView") ||
      app.metamodels.isKindOf(kind, "AWSIconNodeView")
    );
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    this.lineColor = AWS_COLOR_SQUID;
    canvas.rect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      this.model.dashed ? [3, 3] : [],
    );
  }
}

/**
 * AWSAvailabilityZoneView
 */
class AWSAvailabilityZoneView extends AWSGeneralNodeView {
  canContainViewKind(kind) {
    return (
      app.metamodels.isKindOf(kind, "AWSGeneralNodeView") ||
      app.metamodels.isKindOf(kind, "AWSIconNodeView")
    );
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    this.lineColor = AWS_COLOR_ORBIT;
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom(), [3, 3]);
  }
}

/**
 * AWSSecurityGroupView
 */
class AWSSecurityGroupView extends AWSGeneralNodeView {
  canContainViewKind(kind) {
    return (
      app.metamodels.isKindOf(kind, "AWSGeneralNodeView") ||
      app.metamodels.isKindOf(kind, "AWSIconNodeView")
    );
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    this.lineColor = "#CB464F";
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom());
  }
}

/**
 * AWSServiceView
 */
class AWSServiceView extends AWSIconNodeView {}

/**
 * AWSResourceView
 */
class AWSResourceView extends AWSIconNodeView {}

/**
 * AWSGeneralResourceView
 */
class AWSGeneralResourceView extends AWSIconNodeView {}

/**
 * AWSCalloutView
 */
class AWSCalloutView extends AWSGeneralNodeView {
  constructor() {
    super();
    this.containerExtending = false;
    this.containerChangeable = true;
    this.sizable = NodeView.SZ_RATIO;
    this.fillColor = "#000000";
    this.fontColor = "#ffffff";
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = CALLOUT_MINWIDTH;
    this.minHeight = CALLOUT_MINHEIGHT;
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
    super.arrange(canvas);
    this.nameLabel.left = this.left;
    this.nameLabel.width = this.width;
    this.nameLabel.height = this.nameLabel.minHeight;
    this.nameLabel.top =
      this.top + Math.round((this.height - this.nameLabel.height) / 2);
  }

  drawObject(canvas) {
    canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom());
    super.drawObject(canvas);
  }
}

/**
 * AWSArrowView
 */
class AWSArrowView extends AWSGeneralEdgeView {
  constructor() {
    super();
    this.lineStyle =
      app.preferences.get("aws.arrow.lineStyle", EdgeView.LS_ROUNDRECT) ||
      app.preferences.get("view.lineStyle", EdgeView.LS_OBLIQUE);
    this.headEndStyle = EdgeView.ES_STICK_ARROW;
  }
}

type.AWSElement = AWSElement;
type.AWSDiagram = AWSDiagram;
type.AWSModel = AWSModel;
type.AWSGroup = AWSGroup;
type.AWSGenericGroup = AWSGenericGroup;
type.AWSAvailabilityZone = AWSAvailabilityZone;
type.AWSSecurityGroup = AWSSecurityGroup;
type.AWSService = AWSService;
type.AWSResource = AWSResource;
type.AWSGeneralResource = AWSGeneralResource;
type.AWSCallout = AWSCallout;
type.AWSArrow = AWSArrow;
type.AWSGeneralNodeView = AWSGeneralNodeView;
type.AWSIconNodeView = AWSIconNodeView;
type.AWSGeneralEdgeView = AWSGeneralEdgeView;
type.AWSGroupView = AWSGroupView;
type.AWSGenericGroupView = AWSGenericGroupView;
type.AWSAvailabilityZoneView = AWSAvailabilityZoneView;
type.AWSSecurityGroupView = AWSSecurityGroupView;
type.AWSServiceView = AWSServiceView;
type.AWSResourceView = AWSResourceView;
type.AWSGeneralResourceView = AWSGeneralResourceView;
type.AWSCalloutView = AWSCalloutView;
type.AWSArrowView = AWSArrowView;
