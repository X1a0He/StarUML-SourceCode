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
  ExtensibleModel,
  Diagram,
  NodeView,
  Point,
  Canvas
} = app.type

const LEFT_PADDING = 8
const RIGHT_PADDING = 8
const TOP_PADDING = 6
const BOTTOM_PADDING = 6
const ROUND = 14

const FRAME_MINWIDTH = 100
const FRAME_MINHEIGHT = 100
const WIDGET_ROUND = 4

/**
 * WFElement
 */
class WFElement extends ExtensibleModel {
  constructor () {
    super()

    /** @member {string} */
    this.id = ''
  }

  getDisplayClassName () {
    let name = this.getClassName()
    return name.substring(2, name.length)
  }
}

/**
 * WFWireframe
 */
class WFWireframe extends WFElement {}

/**
 * WFWireframeDiagram
 */
class WFWireframeDiagram extends Diagram {
  canAcceptModel (model) {
    return (model instanceof type.Hyperlink) ||
      (model instanceof type.Diagram) ||
      (model instanceof type.WFElement)
  }
}

/**
 * WFFrame
 */
class WFFrame extends WFElement {
  canContain (elem) {
    return elem instanceof WFElement
  }
}

/**
 * @const {string}
 */
WFFrame.OK_PORTRAIT = 'portrait'

/**
 * @const {string}
 */
WFFrame.OK_LANDSCAPE = 'landscape'

/**
 * WFMobileFrame
 */
class WFMobileFrame extends WFFrame {
  constructor () {
    super()

    /** @member {string} */
    this.orientation = WFFrame.OK_PORTRAIT
  }
}

/**
 * WFWebFrame
 */
class WFWebFrame extends WFFrame {}

/**
 * WFDesktopFrame
 */
class WFDesktopFrame extends WFFrame {}

/**
 * WFButton
 */
class WFButton extends WFElement {}

/**
 * WFText
 */
class WFText extends WFElement {}

/**
 * WFRadio
 */
class WFRadio extends WFElement {
  constructor () {
    super()

    /** @member {boolean} */
    this.checked = false
  }
}

/**
 * WFCheckbox
 */
class WFCheckbox extends WFElement {
  constructor () {
    super()

    /** @member {boolean} */
    this.checked = false
  }
}

/**
 * WFSwitch
 */
class WFSwitch extends WFElement {
  constructor () {
    super()

    /** @member {boolean} */
    this.checked = false
  }
}

/**
 * WFLink
 */
class WFLink extends WFElement {}

/**
 * WFTab
 */
class WFTab extends WFElement {
  constructor () {
    super()

    /** @member {string} */
    this.position = WFTab.PK_TOP
  }
}

/**
 * @const {string}
 */
WFTab.PK_TOP = 'top'

/**
 * @const {string}
 */
WFTab.PK_BOTTOM = 'bottom'

/**
 * @const {string}
 */
WFTab.PK_LEFT = 'left'

/**
 * @const {string}
 */
WFTab.PK_RIGHT = 'right'

/**
 * WFTabList
 */
class WFTabList extends WFElement {
  constructor () {
    super()

    /** @member {string} */
    this.position = WFTab.PK_TOP
  }

  canContain (elem) {
    return elem instanceof WFTab
  }
}

/**
 * WFInput
 */
class WFInput extends WFElement {}

/**
 * WFDropdown
 */
class WFDropdown extends WFElement {}

/**
 * WFPanel
 */
class WFPanel extends WFElement {
  canContain (elem) {
    return elem instanceof WFElement
  }
}

/**
 * WFImage
 */
class WFImage extends WFElement {}

/**
 * WFSeparator
 */
class WFSeparator extends WFElement {
  constructor () {
    super()

    /** @member {boolean} */
    this.isVertical = false
  }
}

/**
 * WFAvatar
 */
class WFAvatar extends WFElement {}

/**
 * WFSlider
 */
class WFSlider extends WFElement {
  constructor () {
    super()

    /** @member {number} */
    this.value = 0
  }
}

/**
 * WFGeneralNodeView
 */
class WFGeneralNodeView extends NodeView {
  constructor () {
    super()
    this.containerChangeable = true

    /** @member {boolean} */
    this.wordWrap = true

    /** @member {LabelView} */
    this.nameLabel = new type.LabelView()
    this.nameLabel.horizontalAlignment = Canvas.AL_LEFT
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
    this.minWidth = this.nameLabel.minWidth
    this.minHeight = this.nameLabel.minHeight
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left
    this.nameLabel.setRight(this.getRight())
    this.nameLabel.top = Math.round((this.top + this.getBottom()) / 2) - Math.round((this.nameLabel.height / 2)) + 2
  }
}

/**
 * WFFrameView
 */
class WFFrameView extends NodeView {
  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = FRAME_MINWIDTH
    this.minHeight = FRAME_MINHEIGHT
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), ROUND)
  }

  canContainViewKind (kind) {
    return (app.metamodels.isKindOf(kind, 'WFGeneralNodeView') ||
      app.metamodels.isKindOf(kind, 'WFSwitchView') ||
      app.metamodels.isKindOf(kind, 'WFPanelView') ||
      app.metamodels.isKindOf(kind, 'WFTabListView') ||
      app.metamodels.isKindOf(kind, 'WFImageView') ||
      app.metamodels.isKindOf(kind, 'WFSeparatorView') ||
      app.metamodels.isKindOf(kind, 'WFAvatarView') ||
      app.metamodels.isKindOf(kind, 'WFSliderView'))
  }
}

/**
 * WFMobileFrameView
 */
class WFMobileFrameView extends WFFrameView {
  drawObject (canvas) {
    const yg = Math.round(this.width * 0.1)
    const xg = yg * 0.2
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), yg * 0.5)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), yg * 0.5)
    if (this.model.orientation === WFFrame.OK_PORTRAIT) {
      canvas.rect(this.left + xg, this.top + yg, this.getRight() - xg, this.getBottom() - yg)
    } else {
      canvas.rect(this.left + yg, this.top + xg, this.getRight() - yg, this.getBottom() - xg)
    }
  }
}

/**
 * WFWebFrameView
 */
class WFWebFrameView extends WFFrameView {
  drawObject (canvas) {
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
    canvas.line(this.left, this.top + 20, this.getRight(), this.top + 20)
    canvas.ellipse(this.getRight() - 16, this.top + 4, this.getRight() - 4, this.top + 16)
    canvas.ellipse(this.getRight() - 32, this.top + 4, this.getRight() - 20, this.top + 16)
    canvas.roundRect(this.left + 4, this.top + 4, this.getRight() - 38, this.top + 16, 6)
  }
}

/**
 * WFDesktopFrameView
 */
class WFDesktopFrameView extends WFFrameView {
  drawObject (canvas) {
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
    canvas.line(this.left, this.top + 20, this.getRight(), this.top + 20)
    canvas.rect(this.getRight() - 16, this.top + 4, this.getRight() - 4, this.top + 16)
    canvas.line(this.getRight() - 16, this.top + 4, this.getRight() - 4, this.top + 16)
    canvas.line(this.getRight() - 4, this.top + 4, this.getRight() - 16, this.top + 16)
  }
}

/**
 * WFButtonView
 */
class WFButtonView extends WFGeneralNodeView {
  constructor () {
    super()
    this.nameLabel.horizontalAlignment = Canvas.AL_CENTER
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING
    this.minHeight = this.nameLabel.minHeight + TOP_PADDING + BOTTOM_PADDING
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
  }
}

/**
 * WFTextView
 */
class WFTextView extends WFGeneralNodeView {
  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.top = this.top
    this.nameLabel.left = this.left
    this.nameLabel.setRight(this.getRight())
  }
}

/**
 * WFRadioView
 */
class WFRadioView extends WFGeneralNodeView {
  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = this.nameLabel.minWidth + 18
    this.minHeight = Math.round(this.nameLabel.minHeight, 16)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + 18
    this.nameLabel.setRight(this.getRight())
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    const yc = Math.round((this.top + this.getBottom()) / 2)
    canvas.ellipse(this.left, yc - 7, this.left + 14, yc + 7)
    if (this.model.checked) {
      canvas.fillColor = this.lineColor
      canvas.fillEllipse(this.left + 2, yc - 5, this.left + 12, yc + 5)
      canvas.fillColor = this.fillColor
    }
  }
}

/**
 * WFCheckboxView
 */
class WFCheckboxView extends WFGeneralNodeView {
  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = this.nameLabel.minWidth + 18
    this.minHeight = Math.round(this.nameLabel.minHeight, 16)
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + 18
    this.nameLabel.setRight(this.getRight())
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    const yc = Math.round((this.top + this.getBottom()) / 2)
    canvas.roundRect(this.left, yc - 7, this.left + 14, yc + 7, 3)
    if (this.model.checked) {
      canvas.polyline([
        new Point(this.left + 2, this.top + 2),
        new Point(this.left + 6, yc + 3),
        new Point(this.left + 14, this.top)
      ])
    }
  }
}

/**
 * WFSwitchView
 */
class WFSwitchView extends NodeView {
  constructor () {
    super()
    this.containerChangeable = true
    this.sizable = NodeView.SZ_NONE
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = 26
    this.minHeight = 16
    this.width = this.minWidth
    this.height = this.minHeight
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), Math.round(this.height / 2))
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), Math.round(this.height / 2))
    const g = 2
    if (this.model.checked) {
      canvas.fillColor = this.lineColor
      canvas.fillEllipse(this.getRight() - 15 + g, this.top + g, this.getRight() - g, this.top + 15 - g)
      canvas.fillColor = this.fillColor
    } else {
      canvas.ellipse(this.left + g, this.top + g, this.left + 15 - g, this.top + 15 - g)
    }
  }
}

/**
 * WFLinkView
 */
class WFLinkView extends WFTextView {
  constructor () {
    super()
    this.fontColor = '#2b71ff' // blue
  }

  update (canvas) {
    super.update(canvas)
    this.nameLabel.underline = true
  }
}

/**
 * WFTabView
 */
class WFTabView extends WFGeneralNodeView {
  update (canvas) {
    super.update(canvas)
    if (this.containerView instanceof WFTabListView) {
      this.model.position = this.containerView.model.position
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING
    this.minHeight = this.nameLabel.minHeight + TOP_PADDING + BOTTOM_PADDING
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.left = this.left + LEFT_PADDING
    this.nameLabel.setRight(this.getRight() - RIGHT_PADDING)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    let corners = [WIDGET_ROUND, WIDGET_ROUND, 0, 0]
    if (this.model.position === WFTab.PK_BOTTOM) {
      corners = [0, 0, WIDGET_ROUND, WIDGET_ROUND, 0, 0]
    } else if (this.model.position === WFTab.PK_LEFT) {
      corners = [WIDGET_ROUND, 0, 0, WIDGET_ROUND]
    } else if (this.model.position === WFTab.PK_RIGHT) {
      corners = [0, WIDGET_ROUND, WIDGET_ROUND, 0]
    }
    canvas.fillRoundRect2(this.left, this.top, this.getRight(), this.getBottom(), corners)
    canvas.roundRect2(this.left, this.top, this.getRight(), this.getBottom(), corners)
  }
}

/**
 * WFTabListView
 */
class WFTabListView extends NodeView {
  constructor () {
    super()
    this.containerChangeable = true
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = 24
    this.minHeight = 26
    if (this.model.position === WFTab.PK_TOP || this.model.position === WFTab.PK_BOTTOM) {
      this.minWidth = this.containedViews.length > 0 ? this.containedViews.map(c => c.width).reduce((a, b) => a + b) : 24
    } else {
      this.minHeight = this.containedViews.length > 0 ? this.containedViews.map(c => c.height).reduce((a, b) => a + b) : 24
    }
  }

  arrangeObject (canvas) {
    if (this.model.position === WFTab.PK_TOP || this.model.position === WFTab.PK_BOTTOM) {
      let vs = this.containedViews.filter(v => v instanceof WFTabView)
      vs.sort((a, b) => a.left - b.left)
      let x = this.left
      for (let i = 0; i < vs.length; i++) {
        let v = vs[i]
        v.left = x
        v.top = this.top
        v.setBottom(this.getBottom())
        x += v.width
      }
    } else {
      let vs = this.containedViews.filter(v => v instanceof WFTabView)
      vs.sort((a, b) => a.top - b.top)
      let y = this.top
      for (let i = 0; i < vs.length; i++) {
        let v = vs[i]
        v.top = y
        v.left = this.left
        v.setRight(this.getRight())
        y += v.height
      }
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    if (this.model.position === WFTab.PK_TOP) {
      canvas.line(this.left, this.getBottom(), this.getRight(), this.getBottom())
    } else if (this.model.position === WFTab.PK_BOTTOM) {
      canvas.line(this.left, this.top, this.getRight(), this.top)
    } else if (this.model.position === WFTab.PK_LEFT) {
      canvas.line(this.getRight(), this.top, this.getRight(), this.getBottom())
    } else if (this.model.position === WFTab.PK_RIGHT) {
      canvas.line(this.left, this.top, this.left, this.getBottom())
    }
  }

  canContainViewKind (kind) {
    return app.metamodels.isKindOf(kind, 'WFTabView')
  }
}

/**
 * WFInputView
 */
class WFInputView extends WFGeneralNodeView {
  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING
    this.minHeight = this.nameLabel.minHeight + TOP_PADDING + BOTTOM_PADDING
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.top = this.top + TOP_PADDING
    this.nameLabel.left = this.left + LEFT_PADDING
    this.nameLabel.setRight(this.getRight() - RIGHT_PADDING)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
  }
}

/**
 * WFDropdownView
 */
class WFDropdownView extends WFGeneralNodeView {
  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = this.nameLabel.minWidth + LEFT_PADDING + RIGHT_PADDING + 16
    this.minHeight = this.nameLabel.minHeight + TOP_PADDING + BOTTOM_PADDING
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    this.nameLabel.top = this.top + TOP_PADDING
    this.nameLabel.left = this.left + LEFT_PADDING
    this.nameLabel.setRight(this.getRight() - RIGHT_PADDING)
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRoundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
    canvas.roundRect(this.left, this.top, this.getRight(), this.getBottom(), WIDGET_ROUND)
    const yc = Math.round((this.top + this.getBottom()) / 2)
    const xg = 3
    const yg = 2
    canvas.line(this.getRight() - RIGHT_PADDING, yc - yg, this.getRight() - RIGHT_PADDING - xg, yc + yg)
    canvas.line(this.getRight() - RIGHT_PADDING - xg, yc + yg, this.getRight() - RIGHT_PADDING - xg * 2, yc - yg)
  }
}

/**
 * WFPanelView
 */
class WFPanelView extends NodeView {
  constructor () {
    super()
    this.containerChangeable = true
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = 16
    this.minHeight = 16
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
  }

  canContainViewKind (kind) {
    return (app.metamodels.isKindOf(kind, 'WFGeneralNodeView') ||
      app.metamodels.isKindOf(kind, 'WFSwitchView') ||
      app.metamodels.isKindOf(kind, 'WFPanelView') ||
      app.metamodels.isKindOf(kind, 'WFTabListView') ||
      app.metamodels.isKindOf(kind, 'WFImageView') ||
      app.metamodels.isKindOf(kind, 'WFSeparatorView') ||
      app.metamodels.isKindOf(kind, 'WFAvatarView') ||
      app.metamodels.isKindOf(kind, 'WFSliderView'))
  }
}

/**
 * WFImageView
 */
class WFImageView extends NodeView {
  constructor () {
    super()
    this.containerChangeable = true
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = 16
    this.minHeight = 16
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillRect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.rect(this.left, this.top, this.getRight(), this.getBottom())
    canvas.line(this.left, this.top, this.getRight(), this.getBottom())
    canvas.line(this.getRight(), this.top, this.left, this.getBottom())
  }
}

/**
 * WFSeparatorView
 */
class WFSeparatorView extends NodeView {
  constructor () {
    super()
    this.containerChangeable = true
  }

  update (canvas) {
    super.update(canvas)
    if (this.model.isVertical) {
      this.sizable = NodeView.SZ_VERT
    } else {
      this.sizable = NodeView.SZ_HORZ
    }
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    if (this.model.isVertical) {
      this.minWidth = 8
      this.minHeight = 16
      this.width = this.minWidth
    } else {
      this.minWidth = 16
      this.minHeight = 8
      this.height = this.minHeight
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    if (this.model.isVertical) {
      canvas.line(this.left + 4, this.top, this.left + 4, this.getBottom())
    } else {
      canvas.line(this.left, this.top + 4, this.getRight(), this.top + 4)
    }
  }
}

/**
 * WFAvatarView
 */
class WFAvatarView extends NodeView {
  constructor () {
    super()
    this.containerChangeable = true
    this.sizable = NodeView.SZ_RATIO
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = 24
    this.minHeight = 24
  }

  arrangeObject (canvas) {
    super.arrangeObject(canvas)
    if (this.width <= this.height) {
      this.height = this.width
    } else {
      this.width = this.height
    }
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.fillEllipse(this.left, this.top, this.getRight(), this.getBottom())
    canvas.ellipse(this.left, this.top, this.getRight(), this.getBottom())
    const g = this.width * 0.15
    const xc = Math.round((this.left + this.getRight()) / 2)
    const yc = Math.round((this.top + this.getBottom()) / 2)
    canvas.ellipse(xc - g, yc - g * 2, xc + g, yc)
    canvas.roundRect2(xc - g * 1.5, yc, xc + g * 1.5, yc + g * 2, [WIDGET_ROUND, WIDGET_ROUND, 0, 0])
  }
}

/**
 * WFSliderView
 */
class WFSliderView extends NodeView {
  constructor () {
    super()
    this.containerChangeable = true
    this.sizable = NodeView.SZ_HORZ
  }

  sizeObject (canvas) {
    super.sizeObject(canvas)
    this.minWidth = 16
    this.minHeight = 12
    this.height = this.minHeight
  }

  drawObject (canvas) {
    super.drawObject(canvas)
    canvas.roundRect(this.left, this.top + 4, this.getRight(), this.top + 8, 2)
    let value = this.model.value
    if (value < 0) value = 0
    if (value > 100) value = 100
    const x = (this.width - 12) * (value / 100) + this.left + 6
    canvas.fillEllipse(x - 6, this.top, x + 6, this.getBottom())
    canvas.ellipse(x - 6, this.top, x + 6, this.getBottom())
  }
}

// model elements
type.WFElement = WFElement
type.WFWireframe = WFWireframe
type.WFWireframeDiagram = WFWireframeDiagram
type.WFFrame = WFFrame
type.WFMobileFrame = WFMobileFrame
type.WFWebFrame = WFWebFrame
type.WFDesktopFrame = WFDesktopFrame
type.WFButton = WFButton
type.WFText = WFText
type.WFRadio = WFRadio
type.WFCheckbox = WFCheckbox
type.WFSwitch = WFSwitch
type.WFLink = WFLink
type.WFTab = WFTab
type.WFTabList = WFTabList
type.WFInput = WFInput
type.WFDropdown = WFDropdown
type.WFPanel = WFPanel
type.WFImage = WFImage
type.WFSeparator = WFSeparator
type.WFAvatar = WFAvatar
type.WFSlider = WFSlider

// view elements
type.WFGeneralNodeView = WFGeneralNodeView
type.WFFrameView = WFFrameView
type.WFMobileFrameView = WFMobileFrameView
type.WFWebFrameView = WFWebFrameView
type.WFDesktopFrameView = WFDesktopFrameView
type.WFButtonView = WFButtonView
type.WFTextView = WFTextView
type.WFRadioView = WFRadioView
type.WFCheckboxView = WFCheckboxView
type.WFSwitchView = WFSwitchView
type.WFLinkView = WFLinkView
type.WFTabView = WFTabView
type.WFTabListView = WFTabListView
type.WFInputView = WFInputView
type.WFDropdownView = WFDropdownView
type.WFPanelView = WFPanelView
type.WFImageView = WFImageView
type.WFSeparatorView = WFSeparatorView
type.WFAvatarView = WFAvatarView
type.WFSliderView = WFSliderView
