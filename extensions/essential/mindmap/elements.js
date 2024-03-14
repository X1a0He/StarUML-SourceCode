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
  Color,
  ExtensibleModel,
  DirectedRelationship,
  Diagram,
  NodeView,
  EdgeView,
  Canvas
} = app.type

const SHADOW_OFFSET = 7
const SHADOW_ALPHA = 0.2
const SHADOW_COLOR = Color.LIGHT_GRAY

const LEFT_PADDING = 8
const RIGHT_PADDING = 8
const TOP_PADDING = 6
const BOTTOM_PADDING = 6
const ROUND = 14

/**
 * MMElement
 */
class MMElement extends ExtensibleModel {
  getDisplayClassName () {
    return this.getClassName()
  }
}

/**
 * MMMindmap
 */
class MMMindmap extends MMElement {}

/**
 * MMMindmapDiagram
 */
class MMMindmapDiagram extends Diagram {
  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.MMNode) ||
      (model instanceof type.MMEdge)
  }
}

/**
 * MMNode
 */
class MMNode extends MMElement {}

/**
 * MMEdge
 */
class MMEdge extends DirectedRelationship {}

/**
 * MMNodeView
 */
class MMNodeView extends NodeView {

  constructor () {
    super()
    this.fillColor = app.preferences.get('mindmap.node.fillColor', '#ffffff') || app.preferences.get('view.fillColor', '#ffffff')
    this.lineColor = app.preferences.get('mindmap.node.lineColor', '#000000') || app.preferences.get('view.lineColor', '#000000')

    /** @member {boolean} */
    this.wordWrap = true

    /** @member {LabelView} */
    this.nameLabel = new type.LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
    this.nameLabel.parentStyle = true
    this.addSubView(this.nameLabel)
  }

  update (canvas) {
    super.update(canvas)
    if (this.model) {
      this.nameLabel.text = this.model.name
    }
    this.nameLabel.wordWrap = this.wordWrap
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING
    this.minHeight = this.nameLabel.minHeight + TOP_PADDING + BOTTOM_PADDING
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left
    this.nameLabel.setRight(this.getRight())
    this.nameLabel.top = Math.round((this.top + this.getBottom()) / 2) - Math.round((this.nameLabel.height / 2)) + 2
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ROUND)
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
      ROUND
    )
    canvas.restoreState()
  }
}

/**
 * MMEdgeView
 */
class MMEdgeView extends EdgeView {

  constructor () {
    super()
    this.lineStyle = app.preferences.get('mindmap.edge.lineStyle', EdgeView.LS_ROUNDRECT) || app.preferences.get('view.lineStyle', EdgeView.LS_OBLIQUE)

    this.tailEndStyle = EdgeView.ES_FLAT
    this.headEndStyle = EdgeView.ES_FLAT
    this.lineMode = EdgeView.LM_SOLID
  }

  canConnectTo (view, isTail) {
    return (view.model instanceof MMElement)
  }
}

// model elements
type.MMElement = MMElement
type.MMMindmap = MMMindmap
type.MMMindmapDiagram = MMMindmapDiagram
type.MMNode = MMNode
type.MMEdge = MMEdge

// view elements
type.MMNodeView = MMNodeView
type.MMEdgeView = MMEdgeView
