const yargs = require("yargs");
const fs = require("fs-extra");
const packageJson = require("../../package.json");

const supportedCommands = ["ejs", "image", "html", "pdf", "exec"];

// Enough time to load fonts and validate license
const WAITING_TIME = 2100;

function isElectronBundledApp() {
  return !process.defaultApp;
}

function hasCommand(args) {
  return args.length > 0 && supportedCommands.includes(args[0]);
}

function ejsCommand(argv) {
  if (!fs.existsSync(argv.file)) {
    console.log("[Error] File not found: ", argv.file);
    return;
  }
  if (argv.template && !fs.existsSync(argv.template)) {
    console.log("[Error] File not found: ", argv.template);
    return;
  }
  const window = global.application.openWindow({
    fileToOpen: argv.file,
    hide: true,
  });
  window.on("app-ready", () => {
    // Need time to load fonts and validate license
    setTimeout(() => {
      global.application.sendCommandToAll(
        "cli:ejs",
        argv.template,
        argv.select,
        argv.output,
      );
    }, WAITING_TIME);
  });
}

function imageCommand(argv) {
  if (!fs.existsSync(argv.file)) {
    console.log("[Error] File not found: ", argv.file);
    return;
  }
  const window = global.application.openWindow({
    fileToOpen: argv.file,
    hide: true,
  });
  window.on("app-ready", () => {
    // Need time to load fonts and validate license
    setTimeout(() => {
      global.application.sendCommandToAll(
        "cli:image",
        argv.format,
        argv.select,
        argv.output,
      );
    }, WAITING_TIME);
  });
}

function htmlCommand(argv) {
  if (!fs.existsSync(argv.file)) {
    console.log("[Error] File not found: ", argv.file);
    return;
  }
  const window = global.application.openWindow({
    fileToOpen: argv.file,
    hide: true,
  });
  window.on("app-ready", () => {
    // Need time to load fonts and validate license
    setTimeout(() => {
      global.application.sendCommandToAll("cli:html", argv.output);
    }, WAITING_TIME);
  });
}

function pdfCommand(argv) {
  if (!fs.existsSync(argv.file)) {
    console.log("[Error] File not found: ", argv.file);
    return;
  }
  const window = global.application.openWindow({
    fileToOpen: argv.file,
    hide: true,
  });
  window.on("app-ready", () => {
    // Need time to load fonts and validate license
    setTimeout(() => {
      const options = {
        size: argv.size,
        layout: argv.layout,
        showName: argv.showname,
      };
      global.application.sendCommandToAll(
        "cli:pdf",
        argv.select,
        argv.output,
        options,
      );
    }, WAITING_TIME);
  });
}

function execCommand(argv) {
  if (!fs.existsSync(argv.file)) {
    console.log("[Error] File not found: ", argv.file);
    return;
  }
  const window = global.application.openWindow({
    fileToOpen: argv.file,
    hide: true,
  });
  window.on("app-ready", () => {
    // Need time to load fonts and validate license
    setTimeout(() => {
      global.application.sendCommandToAll("cli:exec", argv.command, argv.arg);
    }, WAITING_TIME);
  });
}

function setup(args) {
  yargs(args)
    .scriptName("staruml")
    .usage("$0 <cmd> [args]")
    .version(packageJson.version)
    .command(
      "ejs file",
      "generates codes with ejs template",
      (yargs) => {
        return yargs
          .positional("file", {
            type: "string",
            describe: "model file (.mdj) to load",
          })
          .option("t", {
            alias: "template",
            type: "string",
            demandOption: true,
            description: "template file (.ejs) to apply",
          })
          .option("o", {
            alias: "output",
            type: "string",
            default: "output.txt",
            description: "output file",
          })
          .option("s", {
            alias: "select",
            type: "string",
            default: "@Project",
            description: "query to select elements",
          });
      },
      function (argv) {
        ejsCommand(argv);
      },
    )
    .command(
      "image file",
      "export diagram images",
      (yargs) => {
        return yargs
          .positional("file", {
            type: "string",
            describe: "model file (.mdj) to load",
          })
          .option("f", {
            alias: "format",
            type: "string",
            default: "png",
            choices: ["png", "jpeg", "svg"],
            description: "image file format",
          })
          .option("o", {
            alias: "output",
            type: "string",
            description: "output file",
          })
          .option("s", {
            alias: "select",
            type: "string",
            default: "@Diagram",
            description: "query to select diagrams",
          });
      },
      function (argv) {
        imageCommand(argv);
      },
    )
    .command(
      "html file",
      "export HTML docs",
      (yargs) => {
        return yargs
          .positional("file", {
            type: "string",
            describe: "model file (.mdj) to load",
          })
          .option("o", {
            alias: "output",
            type: "string",
            default: "./html-docs",
            description: "output path",
          });
      },
      function (argv) {
        htmlCommand(argv);
      },
    )
    .command(
      "pdf file",
      "export diagrams as PDF",
      (yargs) => {
        return yargs
          .positional("file", {
            type: "string",
            describe: "model file (.mdj) to load",
          })
          .option("o", {
            alias: "output",
            type: "string",
            default: "output.pdf",
            description: "output file",
          })
          .option("s", {
            alias: "select",
            type: "string",
            default: "@Diagram",
            description: "query to select diagrams",
          })
          .option("z", {
            alias: "size",
            type: "string",
            default: "A4",
            description: "page size",
          })
          .option("l", {
            alias: "layout",
            type: "string",
            default: "landscape",
            choices: ["landscape", "portrait"],
            description: "page layout",
          })
          .option("n", {
            alias: "showname",
            type: "boolean",
            default: true,
            description: "show diagram name",
          });
      },
      function (argv) {
        pdfCommand(argv);
      },
    )
    .command(
      "exec file",
      "execute a command",
      (yargs) => {
        return yargs
          .positional("file", {
            type: "string",
            describe: "model file (.mdj) to load",
          })
          .option("c", {
            alias: "command",
            type: "string",
            default: null,
            description: "command id to execute",
          })
          .option("a", {
            alias: "arg",
            type: "string",
            default: null,
            description: "argument for the command",
          });
      },
      function (argv) {
        execCommand(argv);
      },
    )
    .help()
    .parse();
}

function handle() {
  const args = process.argv.slice(isElectronBundledApp() ? 1 : 2);
  if (
    hasCommand(args) ||
    args.includes("--help") ||
    args.includes("--version")
  ) {
    setup(args);
    global.application.cliMode = true;
    return true;
  }
  return false;
}

exports.handle = handle;
