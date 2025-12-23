// src/system/logger.js

const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "../../logs/ciphervault.log");

// Ensure logs folder exists
if (!fs.existsSync(path.dirname(logFile))) {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
}

function log(message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(logFile, entry);
}

module.exports = {
    log
};
