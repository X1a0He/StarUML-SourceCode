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
  Hyperlink,
  EdgeParasiticView,
  Canvas,
  Rect,
} = app.type;

const LEFT_PADDING = 8;
const RIGHT_PADDING = 8;
const TOP_PADDING = 8;
const BOTTOM_PADDING = 8;

const SHADOW_OFFSET = 2;
const SHADOW_ALPHA = 0.5;
const SHADOW_COLOR = "#E2E2E2";

const USER_ICON_WIDTH = 48;
const USER_ICON_HEIGHT = 48;

const PRODUCT_ICON_WIDTH = 32;
const PRODUCT_ICON_HEIGHT = 32;

const SERVICE_ICON_WIDTH = 32;
const SERVICE_ICON_HEIGHT = 32;

const EXPANDED_ICON_WIDTH = 24;
const EXPANDED_ICON_HEIGHT = 24;

const GOOGLE_BLUE = "#4284F3";
const GOOGLE_GRAY = "#9E9E9E";
const GOOGLE_GREEN = "#34A853";
const GOOGLE_RED = "#EA4335";

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

function drawCircleNumber(canvas, x, y, value) {
  canvas.storeState();
  canvas.fillColor = GOOGLE_BLUE;
  canvas.fontColor = "#FFFFFF";
  const text = value.toString();
  const m = canvas.textExtent(text);
  const r = new Rect(x, y, x + Math.max(16, m.x + 4), y + 16);
  canvas.fillRoundRect(r.x1, r.y1, r.x2, r.y2, 8);
  canvas.textOut2(
    r,
    text,
    Canvas.AL_CENTER,
    Canvas.AL_MIDDLE,
    false,
    false,
    false,
  );
  canvas.restoreState();
}

/**
 * GCPElement
 */
class GCPElement extends ExtensibleModel {
  constructor() {
    super();

    /** @type {string} */
    this.icon = "";
  }

  getDisplayClassName() {
    return this.getClassName();
  }
}

/**
 * GCPDiagram
 */
class GCPDiagram extends Diagram {
  canAcceptModel(model) {
    return (
      model instanceof Hyperlink ||
      model instanceof Diagram ||
      model instanceof type.GCPElement ||
      model instanceof type.GCPRelationship
    );
  }
}

/**
 * GCPModel
 */
class GCPModel extends GCPElement {}

/**
 * GCPUser
 */
class GCPUser extends GCPElement {
  constructor() {
    super();
    this.icon = "users.png"; // default user card
    this.__assetBaseDir = "gcp/users-and-devices";
  }
}

/**
 * GCPZone
 */
class GCPZone extends GCPElement {
  constructor() {
    super();

    /** @type {string} */
    this.zoneType = GCPZone.ZK_PROJECT;
  }

  canContainKind(kind) {
    return app.metamodels.isKindOf(kind, "GCPElement");
  }
}

/**
 * GCPZoneKind: `project`
 * @const {string}
 */
GCPZone.ZK_PROJECT = "project";

/**
 * GCPZoneKind: `logical-group`
 * @const {string}
 */
GCPZone.ZK_LOGICAL_GROUP = "logical-group";

/**
 * GCPZoneKind: `region`
 * @const {string}
 */
GCPZone.ZK_REGION = "region";

/**
 * GCPZoneKind: `zone`
 * @const {string}
 */
GCPZone.ZK_ZONE = "zone";

/**
 * GCPZoneKind: `sub-network`
 * @const {string}
 */
GCPZone.ZK_SUB_NETWORK = "sub-network";

/**
 * GCPZoneKind: `firewall`
 * @const {string}
 */
GCPZone.ZK_FIREWALL = "firewall";

/**
 * GCPZoneKind: `instance-group`
 * @const {string}
 */
GCPZone.ZK_INSTANCE_GROUP = "instance-group";

/**
 * GCPZoneKind: `replica-pool`
 * @const {string}
 */
GCPZone.ZK_REPLICA_POOL = "replica-pool";

/**
 * GCPZoneKind: `kubernetes-cluster`
 * @const {string}
 */
GCPZone.ZK_KUBERNETES_CLUSTER = "kubernetes-cluster";

/**
 * GCPZoneKind: `pod`
 * @const {string}
 */
GCPZone.ZK_POD = "pod";

/**
 * GCPZoneKind: `account`
 * @const {string}
 */
GCPZone.ZK_ACCOUNT = "account";

/**
 * GCPZoneKind: `optional`
 * @const {string}
 */
GCPZone.ZK_OPTIONAL = "optional";

/**
 * GCPZoneKind: `system`
 * @const {string}
 */
GCPZone.ZK_SYSTEM = "system";

/**
 * GCPZoneKind: `infrastructure-system`
 * @const {string}
 */
GCPZone.ZK_INFRASTRUCTURE_SYSTEM = "infrastructure-system";

/**
 * GCPZoneKind: `on-premises`
 * @const {string}
 */
GCPZone.ZK_ON_PREMISES = "on-premises";

/**
 * GCPZoneKind: `external-saas-providers`
 * @const {string}
 */
GCPZone.ZK_EXTERNAL_SAAS_PROVIDERS = "external-saas-providers";

/**
 * GCPZoneKind: `external-data-sources`
 * @const {string}
 */
GCPZone.ZK_EXTERNAL_DATA_SOURCES = "external-data-sources";

/**
 * GCPZoneKind: `external-thirdparty-infrastructure`
 * @const {string}
 */
GCPZone.ZK_EXTERNAL_THIRDPARTY_INFRASTRUCTURE =
  "external-thirdparty-infrastructure";

/**
 * GCPZoneKind: `external-firstparty-infrastructure`
 * @const {string}
 */
GCPZone.ZK_EXTERNAL_FIRSTPARTY_INFRASTRUCTURE =
  "external-firstparty-infrastructure";

/**
 * GCPZoneKind: `user`
 * @const {string}
 */
GCPZone.ZK_USER = "user";

/**
 * GCPProduct
 */
class GCPProduct extends GCPElement {
  constructor() {
    super();
    this.icon = "Compute-Engine.svg"; // default product card
    this.__assetBaseDir = "gcp/products";

    /** @type {string} */
    this.product = "Compute Engine";

    /** @type {boolean} */
    this.multiInstance = false;

    /** @type {boolean} */
    this.expanded = false;

    /** @type {string} */
    this.expandedInfo = "";

    /** @type {string} */
    this.machineType = "none";

    /** @type {number} */
    this.cores = 0;

    /** @type {number} */
    this.ram = 0;

    /** @type {string} */
    this.diskType = "none";

    /** @type {number} */
    this.disks = 0;

    /** @type {string} */
    this.additionalModifier = "none";
  }
}

/**
 * GCPService
 */
class GCPService extends GCPElement {
  constructor() {
    super();
    this.icon = "Application-System.png"; // default service card
    this.__assetBaseDir = "gcp/services";
  }
}

/**
 * GCPPath
 */
class GCPPath extends DirectedRelationship {
  constructor() {
    super();

    /** @type {string} */
    this.pathType = GCPPath.PK_PRIMARY;
  }
}

/**
 * GCPPathKind: `primary`
 * @const {string}
 */
GCPPath.PK_PRIMARY = "primary";

/**
 * GCPPathKind: `optional-primary`
 * @const {string}
 */
GCPPath.PK_OPTIONAL_PRIMARY = "optional-primary";

/**
 * GCPPathKind: `secondary`
 * @const {string}
 */
GCPPath.PK_SECONDARY = "secondary";

/**
 * GCPPathKind: `optional-secondary`
 * @const {string}
 */
GCPPath.PK_OPTIONAL_SECONDARY = "optional-secondary";

/**
 * GCPPathKind: `success`
 * @const {string}
 */
GCPPath.PK_SUCCESS = "success";

/**
 * GCPPathKind: `failture`
 * @const {string}
 */
GCPPath.PK_FAILURE = "failure";

/* --------------------------- View Elements  ------------------------------- */

/**
 * GCPGeneralNodeView
 */
class GCPGeneralNodeView extends NodeView {
  constructor() {
    super();
    this.containerChangeable = true;

    /** @type {boolean} */
    this.wordWrap = true;

    /** @type {LabelView} */
    this.nameLabel = new LabelView();
    this.nameLabel.parentStyle = true;
    this.nameLabel.horizontalAlignment = Canvas.AL_LEFT;
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
 * GCPGeneralEdgeView
 */
class GCPGeneralEdgeView extends EdgeView {
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
    return view.model instanceof GCPElement;
  }

  canDelete() {
    return false;
  }
}

/**
 * GCPUserView
 */
class GCPUserView extends GCPGeneralNodeView {
  constructor() {
    super();
    this.lineColor = "#E2E2E2";
    this.__icon = {
      img: new Image(),
      state: 0, // 0 = not loaded, 1 = loading, 2 = loaded, 4 = error
    };
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = Math.max(
      this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING,
      USER_ICON_WIDTH,
    );
    this.minHeight =
      USER_ICON_HEIGHT +
      TOP_PADDING +
      this.nameLabel.minHeight +
      BOTTOM_PADDING;
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);
    this.nameLabel.left = this.left + LEFT_PADDING;
    this.nameLabel.top = this.top + USER_ICON_HEIGHT + TOP_PADDING;
    this.nameLabel.width = this.width - (LEFT_PADDING + RIGHT_PADDING);
    this.nameLabel.height = this.nameLabel.minHeight;
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    canvas.fillRoundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      2,
    );
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), 2);
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
      this.left + Math.round((this.width - USER_ICON_WIDTH) / 2),
      this.top,
      USER_ICON_WIDTH,
      USER_ICON_HEIGHT,
    );
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
      2,
    );
    canvas.restoreState();
  }
}

/**
 * GCPZoneView
 */
class GCPZoneView extends GCPGeneralNodeView {
  canContainViewKind(kind) {
    return app.metamodels.isKindOf(kind, "GCPGeneralNodeView");
  }

  update(canvas) {
    super.update(canvas);
    switch (this.model.zoneType) {
      case GCPZone.ZK_PROJECT:
        this.fillColor = "#F6F6F6";
        break;
      case GCPZone.ZK_LOGICAL_GROUP:
        this.fillColor = "#E3F2FD";
        break;
      case GCPZone.ZK_REGION:
        this.fillColor = "#ECEFF1";
        break;
      case GCPZone.ZK_ZONE:
        this.fillColor = "#FFF3E0";
        break;
      case GCPZone.ZK_SUB_NETWORK:
        this.fillColor = "#EDE7F6";
        break;
      case GCPZone.ZK_FIREWALL:
        this.fillColor = "#FBE9E7";
        break;
      case GCPZone.ZK_INSTANCE_GROUP:
        this.fillColor = "#F9FBE7";
        break;
      case GCPZone.ZK_REPLICA_POOL:
        this.fillColor = "#E0F7FA";
        break;
      case GCPZone.ZK_KUBERNETES_CLUSTER:
        this.fillColor = "#FCE4EC";
        break;
      case GCPZone.ZK_POD:
        this.fillColor = "#E8F5E9";
        break;
      case GCPZone.ZK_ACCOUNT:
        this.fillColor = "#E8EAF6";
        break;
      case GCPZone.ZK_OPTIONAL:
        this.fillColor = "#FFFFFF";
        break;
      case GCPZone.ZK_SYSTEM:
        this.fillColor = "#F1F8E9";
        break;
      case GCPZone.ZK_INFRASTRUCTURE_SYSTEM:
        this.fillColor = "#F3E5F5";
        break;
      case GCPZone.ZK_ON_PREMISES:
        this.fillColor = "#EFEBE9";
        break;
      case GCPZone.ZK_EXTERNAL_SAAS_PROVIDERS:
        this.fillColor = "#FFEBEE";
        break;
      case GCPZone.ZK_EXTERNAL_DATA_SOURCES:
        this.fillColor = "#FFF8E1";
        break;
      case GCPZone.ZK_EXTERNAL_THIRDPARTY_INFRASTRUCTURE:
        this.fillColor = "#E0F2F1";
        break;
      case GCPZone.ZK_EXTERNAL_FIRSTPARTY_INFRASTRUCTURE:
        this.fillColor = "#E1F5FE";
        break;
      case GCPZone.ZK_USER:
        this.fillColor = "#FFFFFF";
        break;
      default:
        break;
    }
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING;
    this.minHeight = TOP_PADDING + this.nameLabel.minHeight + BOTTOM_PADDING;
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);
    this.nameLabel.left = this.left + LEFT_PADDING;
    this.nameLabel.top = this.top + TOP_PADDING;
    this.nameLabel.width = this.width - LEFT_PADDING - RIGHT_PADDING;
    this.nameLabel.height = this.nameLabel.minHeight;
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    canvas.fillRoundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      2,
    );
    if (this.model.zoneType === GCPZone.ZK_OPTIONAL) {
      canvas.roundRect(
        this.left,
        this.top,
        this.getRight(),
        this.getBottom(),
        2,
        [4, 4],
      );
    }
  }
}

/**
 * GCPProductView
 */
class GCPProductView extends GCPGeneralNodeView {
  constructor() {
    super();
    this.lineColor = "#E2E2E2";
    this.__icon = {
      img: new Image(),
      state: 0, // 0 = not loaded, 1 = loading, 2 = loaded, 4 = error
    };
    this.__machineIcon = {
      img: new Image(),
      state: 0, // 0 = not loaded, 1 = loading, 2 = loaded, 4 = error
    };
    this.__diskIcon = {
      img: new Image(),
      state: 0, // 0 = not loaded, 1 = loading, 2 = loaded, 4 = error
    };
    this.__modifierIcon = {
      img: new Image(),
      state: 0, // 0 = not loaded, 1 = loading, 2 = loaded, 4 = error
    };

    /** @type {LabelView} */
    this.productLabel = new LabelView();
    this.productLabel.parentStyle = true;
    this.productLabel.horizontalAlignment = Canvas.AL_LEFT;
    this.productLabel.verticalAlignment = Canvas.AL_MIDDLE;
    this.addSubView(this.productLabel);

    /** @type {LabelView} */
    this.expandedLabel = new LabelView();
    this.expandedLabel.parentStyle = true;
    this.expandedLabel.horizontalAlignment = Canvas.AL_LEFT;
    this.expandedLabel.verticalAlignment = Canvas.AL_MIDDLE;
    this.addSubView(this.expandedLabel);
  }

  getPartSizes() {
    // icon width and height
    const iw = LEFT_PADDING + PRODUCT_ICON_WIDTH + RIGHT_PADDING;
    const ih = TOP_PADDING + PRODUCT_ICON_HEIGHT + BOTTOM_PADDING;
    // main width and height
    const mw = Math.max(this.nameLabel.minWidth, this.productLabel.minWidth);
    const mh =
      TOP_PADDING +
      this.nameLabel.minHeight +
      TOP_PADDING / 2 +
      this.productLabel.minHeight +
      TOP_PADDING;
    // core width and height (core = icon + main)
    const cw = iw + mw;
    const ch = Math.max(ih, mh);
    // expanded width and height
    const hasIcon =
      this.model.machineType !== "none" ||
      (this.model.diskType !== "none") |
        (this.model.additionalModifier !== "none");
    const ew = this.model.expanded
      ? LEFT_PADDING +
        Math.max(
          this.expandedLabel.minWidth,
          (EXPANDED_ICON_WIDTH + LEFT_PADDING) * 3,
        ) +
        RIGHT_PADDING
      : 0;
    const eh = this.model.expanded
      ? TOP_PADDING +
        this.expandedLabel.minHeight +
        (hasIcon ? TOP_PADDING + EXPANDED_ICON_HEIGHT + BOTTOM_PADDING : 0) +
        BOTTOM_PADDING
      : 0;
    return { iw, ih, mw, mh, cw, ch, ew, eh };
  }

  update(canvas) {
    super.update(canvas);
    if (this.model) {
      this.productLabel.text = this.model.product;
      this.expandedLabel.text = this.model.expandedInfo;
      this.expandedLabel.visible = this.model.expanded;
    }
    this.productLabel.wordWrap = this.wordWrap;
    this.productLabel.fontColor = "#707070";
    this.expandedLabel.wordWrap = this.wordWrap;
    this.expandedLabel.fontColor = "#8E8E8E";
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    const { iw, ih, mw, mh, ew, eh } = this.getPartSizes();
    this.minWidth = iw + Math.max(mw, ew);
    this.minHeight = Math.max(ih, mh + eh);
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);
    const { iw, mh, ch } = this.getPartSizes();
    this.nameLabel.width = this.width - iw;
    this.nameLabel.height = this.nameLabel.minHeight;
    this.nameLabel.left = this.left + iw;
    this.nameLabel.top = this.top + TOP_PADDING + Math.round((ch - mh) / 2);
    this.productLabel.width = this.width - iw;
    this.productLabel.height = this.productLabel.minHeight;
    this.productLabel.left = this.left + iw;
    this.productLabel.top = this.nameLabel.getBottom() + TOP_PADDING / 2;
    this.expandedLabel.width = this.width - iw;
    this.expandedLabel.height = this.expandedLabel.minHeight;
    this.expandedLabel.left = this.left + iw;
    this.expandedLabel.top = this.top + mh + TOP_PADDING;
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    if (this.model.multiInstance) {
      const offset = 6;
      canvas.storeState();
      canvas.alpha = SHADOW_ALPHA;
      canvas.fillColor = SHADOW_COLOR;
      canvas.fillRoundRect(
        this.left + offset + SHADOW_OFFSET,
        this.top + offset + SHADOW_OFFSET,
        this.getRight() + offset + SHADOW_OFFSET,
        this.getBottom() + offset + SHADOW_OFFSET,
        2,
      );
      canvas.restoreState();
      canvas.fillRoundRect(
        this.left + offset,
        this.top + offset,
        this.getRight() + offset,
        this.getBottom() + offset,
        2,
      );
      canvas.roundRect(
        this.left + offset,
        this.top + offset,
        this.getRight() + offset,
        this.getBottom() + offset,
        2,
      );
    }
    canvas.storeState();
    canvas.alpha = SHADOW_ALPHA;
    canvas.fillColor = SHADOW_COLOR;
    canvas.fillRoundRect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      2,
    );
    canvas.restoreState();
    canvas.fillRoundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      2,
    );
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), 2);
    const { iw, mh } = this.getPartSizes();
    if (this.model.expanded) {
      canvas.line(
        this.left + iw,
        this.top + mh,
        this.getRight(),
        this.top + mh,
      );
    }
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
      this.left + LEFT_PADDING,
      this.top + TOP_PADDING,
      PRODUCT_ICON_WIDTH,
      PRODUCT_ICON_HEIGHT,
    );
    // draw machine icon
    const expandedBasePath = path.join(
      __dirname,
      `../../../resources/assets/gcp/expanded-icons`,
    );
    if (this.model.expanded && this.model.machineType !== "none") {
      loadAndDrawImage(
        canvas,
        this.__machineIcon,
        expandedBasePath,
        `${this.model.machineType}.png`,
        this.left + iw,
        this.expandedLabel.getBottom() + TOP_PADDING,
        EXPANDED_ICON_WIDTH,
        EXPANDED_ICON_HEIGHT,
      );
      const y =
        this.expandedLabel.getBottom() + TOP_PADDING + EXPANDED_ICON_HEIGHT;
      if (this.model.cores > 0)
        drawCircleNumber(canvas, this.left + iw - 8, y - 10, this.model.cores);
      if (this.model.ram > 0)
        drawCircleNumber(
          canvas,
          this.left + iw + EXPANDED_ICON_WIDTH - 8,
          y - 10,
          this.model.ram,
        );
    }
    if (this.model.expanded && this.model.diskType !== "none") {
      loadAndDrawImage(
        canvas,
        this.__diskIcon,
        expandedBasePath,
        `disk.png`,
        this.left + iw + EXPANDED_ICON_WIDTH + LEFT_PADDING,
        this.expandedLabel.getBottom() + TOP_PADDING,
        EXPANDED_ICON_WIDTH,
        EXPANDED_ICON_HEIGHT,
      );
      const y =
        this.expandedLabel.getBottom() + TOP_PADDING + EXPANDED_ICON_HEIGHT;
      if (this.model.disks > 0)
        drawCircleNumber(
          canvas,
          this.left + iw + EXPANDED_ICON_WIDTH * 2 - 4,
          y - 10,
          this.model.disks,
        );
    }
    if (this.model.expanded && this.model.additionalModifier !== "none") {
      loadAndDrawImage(
        canvas,
        this.__modifierIcon,
        expandedBasePath,
        `${this.model.additionalModifier}.png`,
        this.left + iw + (EXPANDED_ICON_WIDTH + LEFT_PADDING) * 2,
        this.expandedLabel.getBottom() + TOP_PADDING,
        EXPANDED_ICON_WIDTH,
        EXPANDED_ICON_HEIGHT,
      );
    }
  }
}

/**
 * GCPServiceView
 */
class GCPServiceView extends GCPGeneralNodeView {
  constructor() {
    super();
    this.lineColor = "#E2E2E2";
    this.__icon = {
      img: new Image(),
      state: 0, // 0 = not loaded, 1 = loading, 2 = loaded, 4 = error
    };
  }

  sizeObject(canvas) {
    super.sizeObject(canvas);
    this.minWidth =
      LEFT_PADDING +
      SERVICE_ICON_WIDTH +
      LEFT_PADDING +
      this.nameLabel.minWidth +
      RIGHT_PADDING;
    this.minHeight = Math.max(
      SERVICE_ICON_HEIGHT + TOP_PADDING + BOTTOM_PADDING,
      TOP_PADDING + this.nameLabel.minHeight + BOTTOM_PADDING,
    );
  }

  arrangeObject(canvas) {
    super.arrangeObject(canvas);
    this.nameLabel.width =
      this.width -
      (LEFT_PADDING + SERVICE_ICON_WIDTH + LEFT_PADDING + RIGHT_PADDING);
    this.nameLabel.height = this.nameLabel.minHeight;
    this.nameLabel.left =
      this.left + LEFT_PADDING + SERVICE_ICON_WIDTH + LEFT_PADDING;
    this.nameLabel.top =
      this.top + Math.round((this.height - this.nameLabel.height) / 2);
  }

  drawObject(canvas) {
    super.drawObject(canvas);
    canvas.fillRoundRect(
      this.left,
      this.top,
      this.getRight(),
      this.getBottom(),
      2,
    );
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), 2);
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
      this.left + LEFT_PADDING,
      this.top + Math.round((this.height - SERVICE_ICON_HEIGHT) / 2),
      SERVICE_ICON_WIDTH,
      SERVICE_ICON_HEIGHT,
    );
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
      2,
    );
    canvas.restoreState();
  }
}

/**
 * GCPPathView
 */
class GCPPathView extends GCPGeneralEdgeView {
  constructor() {
    super();
    this.lineStyle =
      app.preferences.get("gcp.path.lineStyle", EdgeView.LS_RECTILINEAR) ??
      app.preferences.get("view.lineStyle", EdgeView.LS_OBLIQUE);
    this.headEndStyle = EdgeView.ES_SOLID_ARROW;
  }

  update(canvas) {
    super.update(canvas);
    switch (this.model.pathType) {
      case GCPPath.PK_PRIMARY:
        this.lineColor = GOOGLE_BLUE;
        this.lineMode = EdgeView.LM_SOLID;
        break;
      case GCPPath.PK_OPTIONAL_PRIMARY:
        this.lineColor = GOOGLE_BLUE;
        this.lineMode = EdgeView.LM_DOT;
        break;
      case GCPPath.PK_SECONDARY:
        this.lineColor = GOOGLE_GRAY;
        this.lineMode = EdgeView.LM_SOLID;
        break;
      case GCPPath.PK_OPTIONAL_SECONDARY:
        this.lineColor = GOOGLE_GRAY;
        this.lineMode = EdgeView.LM_DOT;
        break;
      case GCPPath.PK_SUCCESS:
        this.lineColor = GOOGLE_GREEN;
        this.lineMode = EdgeView.LM_SOLID;
        break;
      case GCPPath.PK_FAILURE:
        this.lineColor = GOOGLE_RED;
        this.lineMode = EdgeView.LM_SOLID;
        break;
      default:
        break;
    }
  }
}

type.GCPElement = GCPElement;
type.GCPDiagram = GCPDiagram;
type.GCPModel = GCPModel;
type.GCPUser = GCPUser;
type.GCPZone = GCPZone;
type.GCPProduct = GCPProduct;
type.GCPService = GCPService;
type.GCPPath = GCPPath;

type.GCPGeneralNodeView = GCPGeneralNodeView;
type.GCPGeneralEdgeView = GCPGeneralEdgeView;
type.GCPUserView = GCPUserView;
type.GCPZoneView = GCPZoneView;
type.GCPProductView = GCPProductView;
type.GCPServiceView = GCPServiceView;
type.GCPPathView = GCPPathView;
