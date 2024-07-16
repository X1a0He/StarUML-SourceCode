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

const { shell } = require("electron");
const fs = require("fs");
const Mustache = require("mustache");
const path = require("path");
const Strings = require("../strings");

const unregisteredDialogTemplate = fs.readFileSync(
  path.join(__dirname, "../static/html-contents/unregistered-dialog.html"),
  "utf8",
);

/**
 * Show License Manager Dialog
 * @private
 * @return {Dialog}
 */
function showDialog(remains) {
  const isExpired = remains < 0;

  var context = {
    Strings: Strings,
    metadata: global.app.metadata,
    remains: remains,
    isExpired: isExpired,
  };
  var dialog = app.dialogs.showModalDialogUsingTemplate(
    Mustache.render(unregisteredDialogTemplate, context),
  );
  var $dlg = dialog.getElement();
  var $evalMsg = $dlg.find(".eval-msg");
  var $buyNow = $dlg.find(".buy-now");
  var $enterLicenseKey = $dlg.find(".enter-license-key");
  var $exitBtn = $dlg.find(".exit-app");

  $buyNow.click(function () {
    shell.openExternal(app.config.purchase_url);
  });

  $enterLicenseKey.click(async function () {
    const result = await app.commands.execute("help:enter-license-key");
    if (result.buttonId === "ok") {
      setTimeout(() => {
        $enterLicenseKey.remove();
        $buyNow.remove();
        $evalMsg.html("Please restart the app to apply the license.");
        $exitBtn.html("Restart");
        app.relaunch();
      }, 0);
    }
  });

  dialog.then(({ buttonId }) => {
    if (buttonId === "ok") {
    }
  });

  return dialog;
}

exports.showDialog = showDialog;
