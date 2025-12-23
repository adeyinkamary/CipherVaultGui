// src/core/cryptoUtils.js
const crypto = require("crypto");

/**
 * generateSalt(length = 16) -> Buffer
 */
function generateSalt(length = 16) {
  return crypto.randomBytes(length);
}

/**
 * generateIV() -> Buffer (16 bytes)
 */
function generateIV() {
  return crypto.randomBytes(16);
}

/**
 * bufferToHex(buffer) -> string
 */
function bufferToHex(buffer) {
  return buffer.toString("hex");
}

/**
 * hexToBuffer(hex) -> Buffer
 */
function hexToBuffer(hex) {
  return Buffer.from(hex, "hex");
}

/**
 * secureWipe(buffer)
 * Overwrites a Buffer's memory with zeros (best-effort).
 * Note: JS strings cannot be wiped.
 */
function secureWipe(buffer) {
  if (!buffer) return;
  try {
    if (Buffer.isBuffer(buffer)) {
      buffer.fill(0);
    } else if (typeof buffer === "object" && buffer.buffer && Buffer.isBuffer(buffer.buffer)) {
      // typed array-like
      buffer.buffer.fill(0);
    }
  } catch (e) {
    // best effort — ignore errors
  }
}

module.exports = {
  generateSalt,
  generateIV,
  bufferToHex,
  hexToBuffer,
  secureWipe
};
