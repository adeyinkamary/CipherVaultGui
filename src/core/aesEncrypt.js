// src/core/aesEncrypt.js
const fs = require("fs");
const crypto = require("crypto");
const { pipeline } = require("stream/promises");

/**
 * Encrypt a file using AES-256-GCM (streaming).
 *
 * @param {string} inputPath  - path to plaintext input file
 * @param {string} outputPath - path to write ciphertext (raw ciphertext, no metadata)
 * @param {Buffer} key        - 32-byte AES key
 * @param {Buffer} iv         - 12 or 16-byte IV (12 bytes recommended for GCM)
 * @returns {Promise<Buffer>} - resolves to authTag Buffer (16 bytes)
 */
async function encryptFile(inputPath, outputPath, key, iv) {
  if (!Buffer.isBuffer(key) || key.length !== 32) throw new Error("Key must be a 32-byte Buffer.");
  if (!Buffer.isBuffer(iv) || (iv.length !== 12 && iv.length !== 16)) {
    // GCM best practice: 12-byte IV is recommended. Accept 12 or 16 for compatibility.
    throw new Error("IV must be a 12- or 16-byte Buffer.");
  }

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  // Optional: setAAD if you later want to include associated data:
  // cipher.setAAD(Buffer.from("CipherVault-v1"));

  const inStream = fs.createReadStream(inputPath);
  const outStream = fs.createWriteStream(outputPath, { flags: "w" });

  try {
    await pipeline(inStream, cipher, outStream);
  } catch (err) {
    // ensure cipher stream closed
    throw new Error("Encryption failed: " + err.message);
  }

  // get authTag AFTER stream finishes
  const authTag = cipher.getAuthTag(); // 16 bytes typically
  return authTag;
}

module.exports = { encryptFile };
