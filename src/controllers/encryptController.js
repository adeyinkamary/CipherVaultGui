// src/controllers/encryptController.js

const path = require("path");
const chalk = require("chalk");

const { validatePassword } = require("../core/passwordStrength");
const { generateSalt, generateIV } = require("../core/cryptoUtils");
const { deriveKeyPBKDF2 } = require("../core/keyDerivation");
const { encryptFile: aesEncrypt } = require("../core/aesEncrypt");

const { buildMetadata } = require("../system/metadata");
const {
    ensureDirExists,
    prependMetadataToCipher,
    makeTempFilePath
} = require("../system/fileManager");

const { secureDelete } = require("../system/secureDelete");
const { askPassword } = require("../cli/userPrompts");

async function encryptFile(inputPath, outputPath = null) {
    console.log(chalk.cyan("\n[ CipherVault ] Starting Encryption...\n"));

    try {
        // 1. Pick default encrypted filename if none provided
        if (!outputPath) {
            const dir = path.dirname(inputPath);
            const base = path.basename(inputPath, path.extname(inputPath));
            outputPath = path.join(dir, `${base}.enc`);
        }

        // 2. Get password
        const { password, confirm } = askPassword();

        // 3. Validate password
        const valid = validatePassword(password, confirm);
        if (!valid.valid) {
            console.log(chalk.red("❌ Password invalid: ") + valid.message);
            return;
        }

        console.log(chalk.green(`✔ Password accepted (Entropy: ${valid.entropy} bits)`));

        // 4. Salt + IV
        const salt = generateSalt(16);
        const iv = generateIV();

        // 5. Derive key
        const key = await deriveKeyPBKDF2(password, salt);

        // 6. Encrypt into temporary ciphertext file
        const tempCipher = makeTempFilePath("cipher-temp");
        const authTag = await aesEncrypt(inputPath, tempCipher, key, iv);

        // 7. Build metadata (stores original file extension)
        const originalExt = path.extname(inputPath) || "";
        const header = buildMetadata({
            salt,
            iv,
            authTag,
            originalExtension: originalExt
        });


        // PREVENT RE-ENCRYPTING .enc FILES
        if (inputPath.toLowerCase().endsWith(".enc")) {
            console.log(chalk.red("❌ ERROR: This file is already encrypted (.enc)."));
            console.log(chalk.yellow("CipherVault will not re-encrypt encrypted files to prevent data loss."));
            return;
        }


        // 8. Write final encrypted file
        await ensureDirExists(outputPath);
        await prependMetadataToCipher(tempCipher, outputPath, header);

        // 9. Secure delete original
        await secureDelete(inputPath);
        console.log(chalk.yellow("✔ Original file securely deleted."));

        console.log(chalk.green("\n✔ Encryption successful!"));
        console.log(chalk.blue(`→ Output file: ${outputPath}\n`));

    } catch (err) {
        console.log(chalk.red("❌ Encryption error: " + err.message));
        console.log(chalk.yellow("⚠ Encryption failed — original file NOT deleted."));
    }
}

module.exports = { encryptFile };
