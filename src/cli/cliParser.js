// src/cli/cliParser.js

const chalk = require("chalk");
const { showHelp } = require("./helpMenu");

function parseCLI(args) {
    const command = args[0];
    const input = args[1];
    const output = args[2];

    if (!command) {
        showHelp();
        return null;
    }

    if (command !== "encrypt" && command !== "decrypt") {
        console.log(chalk.redBright("❌ Unknown command.\n"));
        showHelp();
        return null;
    }

    return { command, input, output };
}

module.exports = { parseCLI };
