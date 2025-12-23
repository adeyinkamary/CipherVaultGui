// src/system/backupManager.js

const fs = require("fs");
const path = require("path");

function createBackup(inputFile) {
    try {
        const backupDir = path.join(__dirname, "../../tests/encrypted/backups");

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const fileName = path.basename(inputFile);
        const timestamp = Date.now();
        const backupPath = path.join(backupDir, `${timestamp}_${fileName}`);

        fs.copyFileSync(inputFile, backupPath);

        console.log(`✔ Backup created: ${backupPath}`);
        return backupPath;

    } catch (err) {
        console.error("Backup failed:", err.message);
    }
}

module.exports = { createBackup };
