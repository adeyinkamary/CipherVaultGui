// src/utils/validation.js

const fs = require("fs");
const path = require("path");
const { MAGIC } = require("../system/metadata"); // "CVLT"

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch {
        return false;
    }
}

function isDirectory(filePath) {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch {
        return false;
    }
}

function validateInputFile(inputPath) {
    if (!inputPath) {
        throw new Error("No input file provided.");
    }

    if (!fileExists(inputPath)) {
        throw new Error(`Input file does not exist: ${inputPath}`);
    }

    const size = fs.statSync(inputPath).size;
    if (size === 0) {
        throw new Error("Input file is empty.");
    }

    return true;
}

function validateOutputPath(outputPath) {
    if (!outputPath) {
        throw new Error("Output path not provided.");
    }

    // Prevent overwriting directory
    if (isDirectory(outputPath)) {
        throw new Error("Output path cannot be a directory.");
    }

    return true;
}

/**
 * Check if file begins with CipherVault magic bytes "CVLT"
 */
function isCipherVaultFile(inputPath) {
    if (!fileExists(inputPath)) return false;

    const fd = fs.openSync(inputPath, "r");
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);

    return buf.toString("utf8") === MAGIC;
}

function preventEncryptingEncryptedFile(inputPath) {
    if (isCipherVaultFile(inputPath)) {
        throw new Error("This file is already encrypted with CipherVault.");
    }
}

function preventDecryptingNonEncryptedFile(inputPath) {
    if (!isCipherVaultFile(inputPath)) {
        throw new Error("This file is not a valid CipherVault encrypted file.");
    }
}

module.exports = {
    fileExists,
    isDirectory,
    validateInputFile,
    validateOutputPath,
    isCipherVaultFile,
    preventEncryptingEncryptedFile,
    preventDecryptingNonEncryptedFile
};
