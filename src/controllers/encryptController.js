// src/controllers/encryptController.js
// GUI-ONLY ENCRYPTION CONTROLLER

const path = require("path");

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

/**
 * GUI Encryption Controller
 * Called ONLY from Electron
 */
async function encryptController({ filePath, password, confirmPassword }) {
  if (!filePath) {
    throw new Error("No file selected.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  if (filePath.toLowerCase().endsWith(".enc")) {
    throw new Error("File is already encrypted.");
  }

  const valid = validatePassword(password, confirmPassword);
  if (!valid.valid) {
    throw new Error(valid.message);
  }

  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(dir, `${base}.enc`);

  const salt = generateSalt(16);
  const iv = generateIV();
  const key = await deriveKeyPBKDF2(password, salt);

  const tempCipher = makeTempFilePath("cipher-temp");
  const authTag = await aesEncrypt(filePath, tempCipher, key, iv);

  const header = buildMetadata({
    salt,
    iv,
    authTag,
    originalExtension: path.extname(filePath) || ""
  });

  await ensureDirExists(outputPath);
  await prependMetadataToCipher(tempCipher, outputPath, header);

  await secureDelete(filePath);

  return { outputPath };
}

module.exports = encryptController;
