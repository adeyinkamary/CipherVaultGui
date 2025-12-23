// src/core/aesDecrypt.js
const fs = require("fs");
const crypto = require("crypto");
const { pipeline } = require("stream/promises");

/**
 * Decrypt a file encrypted with AES-256-GCM (streaming).
 *
 * @param {string} inputPath   - path to ciphertext input file (raw ciphertext)
 * @param {string} outputPath  - path to write decrypted plaintext
 * @param {Buffer} key         - 32-byte AES key
 * @param {Buffer} iv          - 12 or 16-byte IV (must match the one used for encrypt)
 * @param {Buffer} authTag     - 16-byte GCM auth tag (from encryption)
 * @returns {Promise<void>}
 */
async function decryptFile(inputPath, outputPath, key, iv, authTag) {
  if (!Buffer.isBuffer(key) || key.length !== 32) throw new Error("Key must be a 32-byte Buffer.");
  if (!Buffer.isBuffer(iv) || (iv.length !== 12 && iv.length !== 16)) {
    throw new Error("IV must be a 12- or 16-byte Buffer.");
  }
  if (!Buffer.isBuffer(authTag) || authTag.length === 0) {
    throw new Error("authTag must be provided as a Buffer.");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  // If set AAD during encryption, set the same AAD before piping:
  // decipher.setAAD(Buffer.from("CipherVault-v1"));

  const inStream = fs.createReadStream(inputPath);
  const outStream = fs.createWriteStream(outputPath, { flags: "w" });

  try {
    await pipeline(inStream, decipher, outStream);
  } catch (err) {
    // GCM will throw if authTag verification fails (e.g. wrong password or corrupted file)
    throw new Error("Decryption failed (auth tag mismatch or corrupt data): " + err.message);
  }
}

module.exports = { decryptFile };
