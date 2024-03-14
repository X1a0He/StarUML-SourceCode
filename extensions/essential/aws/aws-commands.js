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
const { imageToDataURL } = require("../../../src/utils/image-utils");
/**
 * @private
 * New from template
 * @param {string} filename
 */
function handleNewFromTemplate(filename) {
  const fullPath = path.join(__dirname, filename);
  ipcRenderer.send("command", "application:new-from-template", fullPath);
}

/**
 * Set icon
 */
function handleSetIcon(options) {
  const { view } = options;
  if (view.model instanceof type.AWSElement && view.model.__hasIcon) {
    app.iconPickerDialog
      .showDialog(view.model.__assetBaseDir)
      .then(({ buttonId, returnValue }) => {
        if (buttonId === "ok") {
          view.__icon.state = 0; // reload icon image

          const basePath = path.join(
            __dirname,
            `../../../resources/assets`,
            view.model.__assetBaseDir,
            returnValue,
          );
          console.log("basePath", basePath);
          imageToDataURL(basePath, (result) => {
            console.log("result", result);
            view.__icon.state = 0;
            view.__icon.img.src = result.data;
          });

          const name = path
            .parse(returnValue)
            .name.replaceAll("-", " ")
            .replaceAll("_", " ");
          app.engine.setProperties(view.model, {
            icon: returnValue,
            name,
          });
        }
      });
  }
}

function updateMenus() {
  // var views = app.selections.getSelectedViews()
  // var selected = app.selections.getSelected();
  // var isNone = !selected;
  // var isProject = selected instanceof type.Project;
  // var isC4Model = selected instanceof type.C4Model;
  // var isC4Element = selected instanceof type.C4Element;
  // let visibleStates = {
  //   "c4.diagram": isNone || isProject || isC4Model || isC4Element,
  //   "c4.model": isProject,
  //   "c4.person": isC4Model || isC4Element,
  //   "c4.software-system": isC4Model || isC4Element,
  //   "c4.container": isC4Model || isC4Element,
  //   "c4.component": isC4Model || isC4Element,
  // };
  // if (isC4Element) {
  //   visibleStates = {
  //     ...visibleStates,
  //     "uml.class-diagram": true,
  //     "uml.package-diagram": true,
  //     "uml.package": true,
  //   };
  // }
  // app.menu.updateStates(visibleStates, null, null);
}

app.commands.register("aws:new-from-template", handleNewFromTemplate);
app.commands.register("aws:set-icon", handleSetIcon);

// Update Commands
app.on("focus", updateMenus);
app.selections.on("selectionChanged", updateMenus);
app.repository.on("operationExecuted", updateMenus);
