// src/system/secureDelete.js

const fs = require("fs");
const crypto = require("crypto");

async function secureDelete(filePath) {
    try {
        if (!fs.existsSync(filePath)) return;

        const stats = fs.statSync(filePath);
        const fileSize = stats.size;

        console.log(`\n[SecureDelete] Overwriting file (${fileSize} bytes)...`);

        // Open file descriptor for manual overwrite
        const fd = fs.openSync(filePath, "r+");

        const CHUNK_SIZE = 1024 * 64; // 64KB per write
        const buffer = Buffer.alloc(CHUNK_SIZE);

        // PASS 1 — Overwrite with zeros
        for (let offset = 0; offset < fileSize; offset += CHUNK_SIZE) {
            let size = Math.min(CHUNK_SIZE, fileSize - offset);
            const zeroBuf = Buffer.alloc(size, 0);

            fs.writeSync(fd, zeroBuf, 0, size, offset);
        }

        // PASS 2 — Overwrite with random bytes
        for (let offset = 0; offset < fileSize; offset += CHUNK_SIZE) {
            let size = Math.min(CHUNK_SIZE, fileSize - offset);
            const randomBuf = crypto.randomBytes(size);

            fs.writeSync(fd, randomBuf, 0, size, offset);
        }

        // Flush changes to disk
        fs.fsyncSync(fd);
        fs.closeSync(fd);

        // Delete file
        fs.unlinkSync(filePath);

        console.log(`✔ Securely deleted: ${filePath}`);
    } catch (err) {
        console.error("❌ Secure delete failed:", err.message);
    }
}

module.exports = { secureDelete };
