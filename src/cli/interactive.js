const fs = require("fs");
const path = require("path");
const os = require("os");
const inquirer = require("inquirer");
const chalk = require("chalk");

const { encryptFile } = require("../controllers/encryptController");
const { decryptFile } = require("../controllers/decryptController");

/**
 * Starting "user" folders to show
 */
function getUserFolders() {
  const homedir = os.homedir();
  return [
    { name: "Desktop", path: path.join(homedir, "Desktop") },
    { name: "Downloads", path: path.join(homedir, "Downloads") },
    { name: "Documents", path: path.join(homedir, "Documents") },
    { name: "Pictures", path: path.join(homedir, "Pictures") },
    { name: "Videos", path: path.join(homedir, "Videos") },
    { name: "Music", path: path.join(homedir, "Music") },
  ];
}

/**
 * Return directory entries (folders first), with icons and type detection.
 * Filter files depending on mode (encrypt / decrypt).
 */
function listDirEntries(dirPath, mode) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    // folders first
    const folders = entries
      .filter((e) => e.isDirectory())
      .map((e) => ({
        name: `📁 ${e.name}`,
        value: { type: "dir", name: e.name, fullPath: path.join(dirPath, e.name) }
      }));

    // files
    const files = entries
      .filter((e) => e.isFile())
      .filter((e) => {
        const ext = path.extname(e.name).toLowerCase();
        return mode === "encrypt" ? ext !== ".enc" : ext === ".enc";
      })
      .map((e) => {
        const ext = path.extname(e.name).toLowerCase();
        const icon = ext === ".enc" ? "🔐" : "📄";
        return {
          name: `${icon} ${e.name}`,
          value: { type: "file", name: e.name, fullPath: path.join(dirPath, e.name) }
        };
      });

    const choices = [];

    // Parent
    if (path.parse(dirPath).root !== dirPath) {
      choices.push({ name: "⬆️  .. (Go up)", value: { type: "up" } });
    }

    choices.push(...folders, ...files);

    if (folders.length === 0 && files.length === 0) {
      choices.push({ name: chalk.dim("(no items match here)"), value: { type: "noop" } });
    }

    choices.push(new inquirer.Separator());
    choices.push({ name: "🔙 Back to main menu", value: { type: "back" } });

    return choices;
  } catch (err) {
    return [
      {
        name: chalk.red(`(cannot access folder: ${err.message})`),
        value: { type: "noop" }
      },
      { name: "🔙 Back to main menu", value: { type: "back" } }
    ];
  }
}

/**
 * Navigation system
 */
async function navigateAndPick(startDir, mode) {
  let current = startDir;

  while (true) {
    const choices = listDirEntries(current, mode);

    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "pick",
        message: `Browsing: ${current}\nSelect folder or file to ${mode}:`,
        choices,
        pageSize: 20,
      },
    ]);

    const v = answer.pick;

    if (!v) return null;
    if (v.type === "back") return null;
    if (v.type === "noop") continue;
    if (v.type === "up") {
      current = path.dirname(current);
      continue;
    }
    if (v.type === "dir") {
      current = v.fullPath;
      continue;
    }
    if (v.type === "file") {
      return v.fullPath;
    }
  }
}

/**
 * INTERACTIVE MODE
 */
async function interactiveMode() {

  // ❗ REMOVED console.clear() so your banner remains visible

  console.log(chalk.cyan.bold("\n⭐ CipherVault — Interactive Mode\n"));

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          { name: "🔒 Encrypt a file", value: "encrypt" },
          { name: "🔓 Decrypt a file", value: "decrypt" },
          { name: "❌ Exit", value: "exit" },
        ],
      },
    ]);

    if (action === "exit") {
      console.log(chalk.green("Goodbye."));
      process.exit(0);
    }

    // choose folder
    const userFolders = getUserFolders().filter((f) => fs.existsSync(f.path));
    const folderChoices = userFolders.map((f) => ({
      name: `📁 ${f.name}`,
      value: f.path
    }));

    folderChoices.push({ name: "📂 Browse other folder...", value: "__browse__" });
    folderChoices.push({ name: "🔙 Return to main menu", value: "__back__" });

    const { start } = await inquirer.prompt([
      {
        type: "list",
        name: "start",
        message: "Choose a starting folder:",
        choices: folderChoices,
      },
    ]);

    if (start === "__back__") continue;

    let startDir = start;

    if (start === "__browse__") {
      const { custom } = await inquirer.prompt([
        { type: "input", name: "custom", message: "Enter full folder path (e.g. C:\\Users\\You\\SomeFolder):" },
      ]);

      if (!custom || !fs.existsSync(custom)) {
        console.log(chalk.red("Folder not found or invalid. Returning to main menu."));
        continue;
      }

      startDir = custom;
    }

    // navigation
    const filePath = await navigateAndPick(startDir, action);
    if (!filePath) continue;

    // confirm
    const { confirm } = await inquirer.prompt([
      { type: "confirm", name: "confirm", message: `Proceed to ${action}:\n${filePath}`, default: false },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("Cancelled. Returning to main menu.\n"));
      continue;
    }

    try {
      if (action === "encrypt") {
        await encryptFile(filePath);
      } else {
        await decryptFile(filePath);
      }
    } catch (err) {
      console.log(chalk.red("Operation failed: " + err.message));
    }

    const { again } = await inquirer.prompt([
      { type: "confirm", name: "again", message: "Do another operation?", default: true },
    ]);

    if (!again) {
      console.log(chalk.green("Goodbye."));
      process.exit(0);
    }
  }
}

module.exports = { interactiveMode };
