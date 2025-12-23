// src/controllers/decryptController.js

const path = require("path");
const chalk = require("chalk");

const { deriveKeyPBKDF2 } = require("../core/keyDerivation");
const { decryptFile: aesDecrypt } = require("../core/aesDecrypt");

const {
    extractMetadataAndStreamCipher,
    ensureDirExists,
    safeUnlink
} = require("../system/fileManager");

const { askPasswordForDecryption } = require("../cli/userPrompts");

async function decryptFile(encryptedPath, outputPath = null) {
    try {
        console.log(chalk.cyan("\n[ CipherVault ] Starting Decryption...\n"));

        // 1. Ask for password
        const password = askPasswordForDecryption();

        // 2. Extract metadata and ciphertext
        const {
            salt, iv, authTag, originalExtension, cipherPath
        } = await extractMetadataAndStreamCipher(encryptedPath);

        console.log(chalk.green("✔ Metadata loaded."));

        // 3. Derive AES key
        const key = await deriveKeyPBKDF2(password, salt);

        // 4. Auto-restore original filename if user didn't provide output
        let finalOut;
        if (!outputPath) {
            const folder = path.dirname(encryptedPath);
            const baseName = path.basename(encryptedPath, ".enc");
            finalOut = path.join(folder, baseName + originalExtension);
        } else {
            finalOut = outputPath;
        }

        // Ensure folder exists
        await ensureDirExists(finalOut);

        // 5. Perform decryption
        await aesDecrypt(cipherPath, finalOut, key, iv, authTag);

        console.log(chalk.green("\n✔ Decryption successful!"));
        console.log(chalk.blue(`→ Output file: ${finalOut}\n`));

        // Remove temporary cipher file
        safeUnlink(cipherPath);

    } catch (err) {
        console.log(chalk.red("❌ Decryption error: " + err.message));
    }
}

module.exports = { decryptFile };
