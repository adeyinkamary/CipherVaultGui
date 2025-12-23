// src/cli/helpMenu.js

const chalk = require("chalk");

function showHelp() {
    console.log(chalk.yellowBright("CipherVault - Command Line Usage:\n"));

    console.log(chalk.green("Encrypt a file:"));
    console.log("  cipher encrypt <inputFile> <outputFile>\n");

    console.log(chalk.green("Decrypt a file:"));
    console.log("  cipher decrypt <inputFile.enc> <outputFile>\n");

    console.log(chalk.green("Examples:"));
    console.log("  cipher encrypt tests/sample.pdf output/sample.enc");
    console.log("  cipher decrypt output/sample.enc output/sample.pdf\n");

    console.log(chalk.blue("Use strong passwords. Lost passwords cannot be recovered."));
}

module.exports = { showHelp };
