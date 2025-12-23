// src/cli/userPrompts.js

const readline = require("readline-sync");
const chalk = require("chalk");

function askPassword() {
    const password = readline.question(chalk.blue("Enter password: "), {
        hideEchoBack: true,
    });

    const confirm = readline.question(
        chalk.blue("Confirm password: "),
        { hideEchoBack: true }
    );

    return { password, confirm };
}

function askPasswordForDecryption() {
    const password = readline.question(
        chalk.blue("Enter password to decrypt file: "),
        { hideEchoBack: true }
    );

    return password;
}

module.exports = {
    askPassword,
    askPasswordForDecryption
};
