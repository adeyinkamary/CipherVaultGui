#!/usr/bin/env node
process.pkg && process.chdir(require("path").dirname(process.execPath));

const { showBanner } = require("./src/cli/banner");
const { encryptFile } = require("./src/controllers/encryptController");
const { decryptFile } = require("./src/controllers/decryptController");
const { interactiveMode } = require("./src/cli/interactive");
const chalk = require("chalk");

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
    console.log(chalk.cyan(`

                                ⭐ Welcome to CipherVault ⭐

A secure, offline file-encryption system built using:
✔ Node.js
✔ AES-256-GCM Encryption
✔ PBKDF2 Key Derivation
✔ Secure Delete + Metadata System

Encrypts ANY file type. Runs fully offline. Works on Windows with no installation.

Usage:
  ciphervault                 # interactive mode
  ciphervault encrypt <inputFile>
  ciphervault decrypt <inputFile.enc>

Examples:
  ciphervault encrypt "C:\\Users\\Dev\\Desktop\\pic.jpg"
  ciphervault decrypt "C:\\Users\\Dev\\Desktop\\pic.enc"

    `));
}

async function run() {
    // Show banner at startup
    showBanner();

    if (!command) {
        // No args -> interactive mode
        await interactiveMode();
        return;
    }

    switch (command.toLowerCase()) {

        case "encrypt":
            if (!args[1]) {
                console.log(chalk.red("\n❌ Missing input file.\n"));
                showHelp();
                return;
            }
            await encryptFile(args[1]);
            break;

        case "decrypt":
            if (!args[1]) {
                console.log(chalk.red("\n❌ Missing encrypted file.\n"));
                showHelp();
                return;
            }
            await decryptFile(args[1]);
            break;

        case "help":
        default:
            showHelp();
            break;
    }
}

run();
