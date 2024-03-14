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
  Canvas,
  Color,
  Font,
  Rect,
  ExtensibleModel,
  DirectedRelationship,
  Diagram,
  NodeView,
  EdgeView,
  LabelView,
  EdgeLabelView,
  EdgeParasiticView,
  Hyperlink
} = app.type

const SHADOW_OFFSET = 7
const SHADOW_ALPHA = 0.2
const SHADOW_COLOR = Color.LIGHT_GRAY

const COMPARTMENT_ITEM_INTERVAL = 2
const COMPARTMENT_LEFT_PADDING = 8
const COMPARTMENT_RIGHT_PADDING = 8
const COMPARTMENT_TOP_PADDING = 8
const COMPARTMENT_BOTTOM_PADDING = 8
const HEAD_BODY_GAP = 8
const DESCRIPTION_MARGIN = 8

/**
 * C4Element
 */
class C4Element extends ExtensibleModel {
  constructor () {
    super()

    /** @member {string} */
    this.technology = ''

    /** @member {string} */
    this.description = ''
  }

  getDisplayClassName () {
    return this.getClassName()
  }

  canContainDiagramKind (kind) {
    return (kind === 'UMLClassDiagram') ||
      (kind === 'UMLPackageDiagram') ||
      (kind === 'UMLObjectDiagram') ||
      (kind === 'UMLCompositeStructureDiagram') ||
      (kind === 'UMLComponentDiagram') ||
      (kind === 'UMLDeploymentDiagram') ||
      (kind === 'UMLUseCaseDiagram') ||
      (kind === 'C4Diagram')
  }

  canContainKind (kind) {
    return app.metamodels.isKindOf(kind, 'UMLClassifier') ||
      app.metamodels.isKindOf(kind, 'UMLPackage') ||
      app.metamodels.isKindOf(kind, 'UMLInstance') ||
      app.metamodels.isKindOf(kind, 'UMLStateMachine') ||
      app.metamodels.isKindOf(kind, 'UMLActivity') ||
      !app.metamodels.isKindOf(kind, 'UMLModelElement') || // to include Flowchart, DFD, ERD
      app.metamodels.isKindOf(kind, 'C4Element')
  }

}

/**
 * C4Model
 */
class C4Model extends C4Element {}

/**
 * C4Diagram
 */
class C4Diagram extends Diagram {
  canAcceptModel (model) {
    return (model instanceof Hyperlink) ||
    (model instanceof Diagram) ||
    (model instanceof C4Element) ||
    (model instanceof C4Relationship)
  }
}

/**
 * C4Person
 */
class C4Person extends C4Element {}

/**
 * C4SoftwareSystem
 */
class C4SoftwareSystem extends C4Element {}

/**
 * C4Container
 */
class C4Container extends C4Element {
  constructor () {
    super()

    /** @member {string} */
    this.kind = C4Container.CK_ETC
  }
}

/**
 * @const {string}
 */
C4Container.CK_SERVER_WEBAPP = 'server-webapp'

/**
 * @const {string}
 */
C4Container.CK_CLIENT_WEBAPP = 'client-webapp'

/**
 * @const {string}
 */
C4Container.CK_DESKTOP_APP = 'desktop-app'

/**
 * @const {string}
 */
C4Container.CK_MOBILE_APP = 'mobile-app'

/**
 * @const {string}
 */
C4Container.CK_CONSOLE_APP = 'console-app'

/**
 * @const {string}
 */
C4Container.CK_SERVERLESS_FUNCTION = 'serverless-function'

/**
 * @const {string}
 */
C4Container.CK_DATABASE = 'database'

/**
 * @const {string}
 */
C4Container.CK_BLOB_STORE = 'blob-store'

/**
 * @const {string}
 */
C4Container.CK_FILESYSTEM = 'filesystem'

/**
 * @const {string}
 */
C4Container.CK_SHELL_SCRIPT = 'shell-script'

/**
 * @const {string}
 */
C4Container.CK_ETC = 'etc'

/**
 * C4Component
 */
class C4Component extends C4Element {}

/**
* C4Relationship
*/
class C4Relationship extends DirectedRelationship {
  constructor () {
    super()

    /** @member {string} */
    this.technology = ''

    /** @member {string} */
    this.description = ''
  }
}

/* -------------------------- View Elements ---------------------------- */

/**
 * C4GeneralNodeView
 */
class C4GeneralNodeView extends NodeView {
  constructor () {
    super()

    /** @member {LabelView} */
    this.nameLabel = new LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)

    /** @member {LabelView} */
    this.technologyLabel = new LabelView()
    this.technologyLabel.horizontalAlignment = Canvas.AL_CENTER
    this.technologyLabel.parentStyle = true
    this.addSubView(this.technologyLabel)

    /** @member {LabelView} */
    this.descriptionLabel = new LabelView()
    this.descriptionLabel.horizontalAlignment = Canvas.AL_CENTER
    this.descriptionLabel.parentStyle = true
    this.addSubView(this.descriptionLabel)

    /** @member {boolean} */
    this.wordWrap = true

    /* temporal */
    this._leftPadding = COMPARTMENT_LEFT_PADDING
    this._rightPadding = COMPARTMENT_RIGHT_PADDING
    this._topPadding = COMPARTMENT_TOP_PADDING
    this._bottomPadding = COMPARTMENT_BOTTOM_PADDING
    this._itemInterval = COMPARTMENT_ITEM_INTERVAL
    this._internalView = false
    this._alignBottom = false
  }

  /**
   * size
   */
  size (canvas) {
    var i, len
    var w = 0
    var h = this._topPadding
    for (i = 0, len = this.subViews.length; i < len; i++) {
      var item = this.subViews[i]
      if (item.parentStyle) {
        item.font.size = item._parent.font.size
      }
      item.size(canvas)
      if (item.visible) {
        if (w < item.minWidth) {
          w = item.minWidth
        }
        if (i > 0) {
          h += this._itemInterval
        }
        h += item.minHeight
      }
    }
    this.minWidth = w + this._leftPadding + this._rightPadding
    this.minHeight = h + this._bottomPadding + DESCRIPTION_MARGIN
    this.sizeConstraints()
  }

  update (canvas) {
    this._internalView = this._parent.isOneOfTheContainers(this.model)
    if (this._internalView) this._alignBottom = true
    if (this.model) {
      this.nameLabel.text = this.model.name
      this.nameLabel.font.style = Font.FS_BOLD
      this.nameLabel.wordWrap = this.wordWrap
      this.nameLabel.horizontalAlignment = this._alignBottom ? Canvas.AL_LEFT : Canvas.AL_CENTER
      this.technologyLabel.font.size = this.font.size * 0.9
      this.technologyLabel.text = this.model.technology.length > 0 ? `[${this.model.technology}]` : ''
      this.technologyLabel.wordWrap = this.wordWrap
      this.technologyLabel.horizontalAlignment = this._alignBottom ? Canvas.AL_LEFT : Canvas.AL_CENTER
      this.descriptionLabel.text = this.model.description
      this.descriptionLabel.wordWrap = this.wordWrap
      this.descriptionLabel.visible = !this._internalView
    }
    super.update(canvas)
  }

  /**
   * arrange
   */
  arrange (canvas) {
    if (this._alignBottom) {
      let h = this._bottomPadding
      for (let i = this.subViews.length - 1; i >= 0; i--) {
        let item = this.subViews[i]
        if (item.visible) {
          h += item.height
          item.left = this.left + this._leftPadding
          item.top = this.getBottom() - h
          item.width = this.width - this._leftPadding - this._rightPadding
          if (i < this.subViews.length - 1) { h += this._itemInterval }
        }
        item.arrange(canvas)
      }
      h += this._topPadding
    } else {
      let h = this._topPadding
      for (let i = 0, len = this.subViews.length; i < len; i++) {
        let item = this.subViews[i]
        if (item.visible) {
          if (i > 0) { h += this._itemInterval }
          item.left = this.left + this._leftPadding
          item.top = this.top + h
          item.width = this.width - this._leftPadding - this._rightPadding
          h += item.height
        }
        item.arrange(canvas)
      }
      h += this._bottomPadding
    }
    this.descriptionLabel.top += DESCRIPTION_MARGIN
    // this.height = h + DESCRIPTION_MARGIN
    this.sizeConstraints()
  }

  drawObject (canvas) {
    if (this._internalView) {
      canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), 6, [4, 4])
    } else {
      canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), 6)
      canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), 6)
    }
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    canvas.fillRoundRect(
      this.left + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      6
    )
    canvas.restoreState()
  }
}

/**
 * C4GeneralEdgeView
 */
class C4GeneralEdgeView extends EdgeView {
  constructor () {
    super()
    this.wordWrap = true

    /** @member {EdgeLabelView} */
    this.descriptionLabel = new EdgeLabelView()
    this.descriptionLabel.wordWrap = true
    this.descriptionLabel.hostEdge = this
    this.descriptionLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.descriptionLabel.distance = 15
    this.descriptionLabel.alpha = Math.PI / 2
    this.addSubView(this.descriptionLabel)

    /** @member {EdgeLabelView} */
    this.technologyLabel = new EdgeLabelView()
    this.technologyLabel.wordWrap = true
    this.technologyLabel.hostEdge = this
    this.technologyLabel.edgePosition = EdgeParasiticView.EP_MIDDLE
    this.technologyLabel.distance = 15
    this.technologyLabel.alpha = -Math.PI / 2
    this.addSubView(this.technologyLabel)
  }

  update (canvas) {
    if (this.model) {
      // descriptionLabel
      this.descriptionLabel.visible = (this.model.description.length > 0)
      this.descriptionLabel.text = this.model.description
      // technologyLabel
      this.technologyLabel.visible = (this.model.technology.length > 0)
      this.technologyLabel.text = `[${this.model.technology}]`
      // Enforce *label.model refers to this.model by using Bypass Command.
      if (this.descriptionLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.descriptionLabel, 'model', this.model)
      }
      if (this.technologyLabel.model !== this.model) {
        app.repository.bypassFieldAssign(this.technologyLabel, 'model', this.model)
      }
    }
    super.update(canvas)
  }

}

/**
 * C4ElementView
 */
class C4ElementView extends C4GeneralNodeView {
  constructor () {
    super()
    this._alignBottom = true
  }
}

/**
 * C4PersonView
 */
class C4PersonView extends C4GeneralNodeView {
  constructor () {
    super()
    this._headSize = 0
    this.fillColor = app.preferences.get('c4.person.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    this._headSize = Math.round(this.width / 3)
    this._topPadding = this._headSize + COMPARTMENT_TOP_PADDING + HEAD_BODY_GAP
    super.update(canvas)
    this.technologyLabel.text = `[Person${this.model.technology.length > 0 ? ': ' + this.model.technology : ''}]`
  }

  drawObject (canvas) {
    // const headSize = Math.round(this.width / 3)
    const margin = (this.width - this._headSize) / 2
    canvas.fillEllipse(this.left + margin, this.top, this.left + margin + this._headSize, this.top + this._headSize)
    canvas.ellipse(this.left + margin, this.top, this.left + margin + this._headSize, this.top + this._headSize)
    canvas.fillRoundRect(this.left, this.top + this._headSize + HEAD_BODY_GAP, this.getRight(), this.getBottom(), 6)
    canvas.roundRect(this.left, this.top + this._headSize + HEAD_BODY_GAP, this.getRight(), this.getBottom(), 6)
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    const margin = (this.width - this._headSize) / 2
    canvas.fillEllipse(
      this.left + margin + SHADOW_OFFSET,
      this.top + SHADOW_OFFSET,
      this.left + margin + this._headSize + SHADOW_OFFSET,
      this.top + this._headSize + SHADOW_OFFSET
    )
    canvas.fillRoundRect(
      this.left + SHADOW_OFFSET,
      this.top + this._headSize + HEAD_BODY_GAP + SHADOW_OFFSET,
      this.getRight() + SHADOW_OFFSET,
      this.getBottom() + SHADOW_OFFSET,
      6
    )
    canvas.restoreState()
  }
}

/**
 * C4SoftwareSystemView
 */
class C4SoftwareSystemView extends C4GeneralNodeView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('c4.software-system.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    super.update(canvas)
    this.technologyLabel.text = `[Software System${this.model.technology.length > 0 ? ': ' + this.model.technology : ''}]`
  }
}

/**
 * C4ContainerView
 */
class C4ContainerView extends C4GeneralNodeView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('c4.container.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    switch (this.model.kind) {
    case C4Container.CK_CLIENT_WEBAPP:
      this._topPadding = 30
      break
    case C4Container.CK_MOBILE_APP:
      this._topPadding = 16
      this._bottomPadding = 20
      break
    case C4Container.CK_DESKTOP_APP:
      this._topPadding = 20
      break
    case C4Container.CK_CONSOLE_APP:
    case C4Container.CK_SHELL_SCRIPT:
    case C4Container.CK_SERVERLESS_FUNCTION:
      this._topPadding = 30
      break
    case C4Container.CK_DATABASE:
      let h = this.height
      let g = Math.floor(h / 8)
      this._topPadding = COMPARTMENT_TOP_PADDING + g * 2
      break
    default:
      this._topPadding = COMPARTMENT_TOP_PADDING
    }
    super.update(canvas)
    this.technologyLabel.text = `[Container${this.model.technology.length > 0 ? ': ' + this.model.technology : ''}]`
  }

  drawObject (canvas) {
    switch (this.model.kind) {
    case C4Container.CK_CLIENT_WEBAPP:
      super.drawObject(canvas)
      canvas.ellipse(this.left + 8, this.top + 6, this.left + 18, this.top + 16)
      canvas.ellipse(this.left + 22, this.top + 6, this.left + 32, this.top + 16)
      canvas.roundRect(this.left + 36, this.top + 6, this.getRight() - 8, this.top + 16, 5)
      canvas.line(this.left, this.top + 24, this.getRight(), this.top + 24)
      break
    case C4Container.CK_MOBILE_APP:
      super.drawObject(canvas)
      const c = Math.round((this.left + this.getRight()) / 2)
      canvas.line(this.left, this.top + 12, this.getRight(), this.top + 12)
      canvas.line(this.left, this.getBottom() - 16, this.getRight(), this.getBottom() - 16)
      canvas.ellipse(c - 4, this.getBottom() - 12, c + 4, this.getBottom() - 4)
      break
    case C4Container.CK_DESKTOP_APP:
      super.drawObject(canvas)
      canvas.line(this.left, this.top + 15, this.getRight(), this.top + 15)
      canvas.line(this.getRight() - 11, this.top + 4, this.getRight() - 4, this.top + 11)
      canvas.line(this.getRight() - 4, this.top + 4, this.getRight() - 11, this.top + 11)
      break
    case C4Container.CK_SERVERLESS_FUNCTION:
      super.drawObject(canvas)
      canvas.textOut(this.left + 6, this.top + 6, 'λ')
      canvas.line(this.left, this.top + 24, this.getRight(), this.top + 24)
      break
    case C4Container.CK_CONSOLE_APP:
      super.drawObject(canvas)
      canvas.textOut(this.left + 6, this.top + 6, '>_')
      canvas.line(this.left, this.top + 24, this.getRight(), this.top + 24)
      break
    case C4Container.CK_DATABASE:
      let r = new Rect(this.left, this.top, this.getRight(), this.getBottom())
      let w = r.getWidth()
      let h = r.getHeight()
      let xm = (r.x1 + r.x2) / 2
      let g = Math.floor(h / 8)
      let kappa = 0.5522848
      let ox = (w / 2) * kappa // control point offset horizontal
      let oy = g * kappa       // control point offset vertical
      canvas.fillPath([['M', r.x1, r.y1 + g],
      ['C', r.x1, r.y1 + g - oy, xm - ox, r.y1, xm, r.y1],
      ['C', xm + ox, r.y1, r.x2, r.y1 + g - oy, r.x2, r.y1 + g],
      ['L', r.x2, r.y2 - g],
      ['C', r.x2, r.y2 - g + oy, xm + ox, r.y2, xm, r.y2],
      ['C', xm - ox, r.y2, r.x1, r.y2 - g + oy, r.x1, r.y2 - g],
      ['L', r.x1, r.y1 + g],
      ['Z']], true)
      canvas.path([['M', r.x1, r.y1 + g],
      ['C', r.x1, r.y1 + g + oy, xm - ox, r.y1 + (g * 2), xm, r.y1 + (g * 2)],
      ['C', xm + ox, r.y1 + (g * 2), r.x2, r.y1 + g + oy, r.x2, r.y1 + g]])
      break
    case C4Container.CK_SHELL_SCRIPT:
      super.drawObject(canvas)
      canvas.textOut(this.left + 6, this.top + 6, '#_')
      canvas.line(this.left, this.top + 24, this.getRight(), this.top + 24)
      break
    default:
      super.drawObject(canvas)
    }
  }

  drawShadow (canvas) {
    canvas.storeState()
    canvas.alpha = SHADOW_ALPHA
    canvas.fillColor = SHADOW_COLOR
    switch (this.model.kind) {
    case C4Container.CK_DATABASE:
      let r = new Rect(this.left + SHADOW_OFFSET, this.top + SHADOW_OFFSET, this.getRight() + SHADOW_OFFSET, this.getBottom() + SHADOW_OFFSET)
      let w = r.getWidth()
      let h = r.getHeight()
      let xm = (r.x1 + r.x2) / 2
      let g = Math.floor(h / 8)
      let kappa = 0.5522848
      let ox = (w / 2) * kappa // control point offset horizontal
      let oy = g * kappa       // control point offset vertical
      canvas.fillPath([['M', r.x1, r.y1 + g],
      ['C', r.x1, r.y1 + g - oy, xm - ox, r.y1, xm, r.y1],
      ['C', xm + ox, r.y1, r.x2, r.y1 + g - oy, r.x2, r.y1 + g],
      ['L', r.x2, r.y2 - g],
      ['C', r.x2, r.y2 - g + oy, xm + ox, r.y2, xm, r.y2],
      ['C', xm - ox, r.y2, r.x1, r.y2 - g + oy, r.x1, r.y2 - g],
      ['L', r.x1, r.y1 + g],
      ['Z']], false)
      break
    default:
      super.drawShadow(canvas)
    }
    canvas.restoreState()
  }
}

/**
 * C4ComponentView
 */
class C4ComponentView extends C4GeneralNodeView {
  constructor () {
    super()
    this.fillColor = app.preferences.get('c4.component.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
  }

  update (canvas) {
    super.update(canvas)
    this.technologyLabel.text = `[Component${this.model.technology.length > 0 ? ': ' + this.model.technology : ''}]`
  }
}

/**
 * C4RelationshipView
 */
class C4RelationshipView extends C4GeneralEdgeView {
  constructor () {
    super()
    this.lineStyle = app.preferences.get('c4.relationship.lineStyle', EdgeView.LS_ROUNDRECT) || app.preferences.get('view.lineStyle', EdgeView.LS_OBLIQUE)
    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_SOLID_ARROW
    this.lineMode = EdgeView.LM_DOT
  }
}

type.C4Element = C4Element
type.C4Model = C4Model
type.C4Diagram = C4Diagram
type.C4Person = C4Person
type.C4SoftwareSystem = C4SoftwareSystem
type.C4Container = C4Container
type.C4Component = C4Component
type.C4Relationship = C4Relationship
type.C4GeneralNodeView = C4GeneralNodeView
type.C4GeneralEdgeView = C4GeneralEdgeView
type.C4ElementView = C4ElementView
type.C4PersonView = C4PersonView
type.C4SoftwareSystemView = C4SoftwareSystemView
type.C4ContainerView = C4ContainerView
type.C4ComponentView = C4ComponentView
type.C4RelationshipView = C4RelationshipView
