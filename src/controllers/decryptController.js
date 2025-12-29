// src/controllers/decryptController.js
// GUI-ONLY DECRYPTION CONTROLLER

const path = require("path");

const { deriveKeyPBKDF2 } = require("../core/keyDerivation");
const { decryptFile: aesDecrypt } = require("../core/aesDecrypt");

const {
  extractMetadataAndStreamCipher,
  ensureDirExists,
  safeUnlink
} = require("../system/fileManager");

/**
 * GUI Decryption Controller
 * Called ONLY from Electron
 */
async function decryptController({ filePath, password }) {
  if (!filePath) {
    throw new Error("No file selected.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  if (!filePath.toLowerCase().endsWith(".enc")) {
    throw new Error("Invalid encrypted file.");
  }

  // 1. Read metadata + extract ciphertext
  const {
    salt,
    iv,
    authTag,
    originalExtension,
    cipherPath
  } = await extractMetadataAndStreamCipher(filePath);

  // 2. Derive key
  const key = await deriveKeyPBKDF2(password, salt);

  // 3. Restore original filename
  const folder = path.dirname(filePath);
  const baseName = path.basename(filePath, ".enc");
  const outputPath = path.join(folder, baseName + originalExtension);

  await ensureDirExists(outputPath);

  // 4. Decrypt
  await aesDecrypt(cipherPath, outputPath, key, iv, authTag);

  // 5. Cleanup temp file
  await safeUnlink(cipherPath);

  return { outputPath };
}

module.exports = decryptController;
