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

const fs = require("fs");
const path = require("path");
const Mustache = require("mustache");
const ViewUtils = require("../utils/view-utils");
const Strings = require("../strings");

const dialogTemplate = fs.readFileSync(
  path.join(__dirname, "../static/html-contents/icon-picker-dialog.html"),
  "utf8",
);

/**
 * @private
 * Icon Picker Dialog
 */
class IconPickerDialog {
  constructor() {
    /**
     * DataSource for ListView
     * @private
     * @type {kendo.data.DataSource}
     */
    this.dataSource = new kendo.data.DataSource();

    this.autoComplete = null;

    this.selected = null;
  }

  /**
   * Convert Core.Model to DataSource Item
   * @private
   * @param {string} basePath
   * @param {string[]} files
   * @type {kendo.data.DataSource}
   */
  _toDataItem(basePath, file) {
    return {
      id: file,
      icon: path.join(basePath, file),
      text: file
        .replaceAll(".svg", "")
        .replaceAll("-", " ")
        .replaceAll("_", " "),
    };
  }

  updateDataSource(basePath, files, filter = "") {
    this.dataSource.data([]);
    for (let i = 0, len = files.length; i < len; i++) {
      const item = files[i];
      if (filter.trim().length > 0) {
        if (item.toLowerCase().indexOf(filter.toLowerCase()) > -1) {
          this.dataSource.add(this._toDataItem(basePath, item));
        }
      } else {
        this.dataSource.add(this._toDataItem(basePath, item));
      }
    }
  }

  /**
   * Show Icon Picker Dialog.
   * @param {string} baseDir
   * @return {Dialog}
   */
  showDialog(baseDir) {
    var context = {
      Strings,
      title: "Select Icon",
    };
    var dialog = app.dialogs.showModalDialogUsingTemplate(
      Mustache.render(dialogTemplate, context),
      true,
      ($dlg) => {
        $dlg.data("returnValue", this.selected);
      },
    );

    var $dlg = dialog.getElement();
    var $wrapper = $dlg.find(".listview-wrapper");
    ViewUtils.addScrollerShadow($wrapper, null, true);

    // icon files
    const basePath = path.join(__dirname, `../../resources/assets/`, baseDir);
    const files = fs.readdirSync(basePath);

    // setup search
    const $input = $dlg.find(".icon-search-input");
    $input.keyup((e) => {
      const val = e.target.value;
      this.updateDataSource(basePath, files, val);
    });

    // setup listView
    var $listview = $dlg.find(".listview");
    var self = this;
    this.selectedElement = null;
    this.updateDataSource(basePath, files);
    $listview.kendoListView({
      dataSource: this.dataSource,
      template:
        "<div class='list-item'><img src='#=icon#' loading='lazy'><div>#:text#</div></div>",
      selectable: true,
      // eslint-disable-next-line object-shorthand, no-unused-vars
      change: function (e) {
        var selected = this.select();
        if (selected && selected.length > 0) {
          var dataItem = self.dataSource.getByUid(selected[0].dataset.uid);
          self.selected = dataItem.id;
        }
      },
    });
    return dialog;
  }
}

module.exports = IconPickerDialog;
