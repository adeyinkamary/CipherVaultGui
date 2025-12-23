// src/core/keyDerivation.js
const crypto = require("crypto");
const { promisify } = require("util");
const scryptAsync = promisify(crypto.scrypt);
const pbkdf2Async = promisify(crypto.pbkdf2);

// Defaults — you can tune these in config.js later
const DEFAULT_PBKDF2_ITER = 200000; // balance: security vs time (adjust per hardware)
const PBKDF2_KEYLEN = 32; // 256-bit key
const DEFAULT_SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, keylen: 32 }; // moderate memory-hard params

/**
 * deriveKeyPBKDF2(password, salt, iterations = DEFAULT_PBKDF2_ITER)
 * returns Buffer (32 bytes)
 */
async function deriveKeyPBKDF2(password, salt, iterations = DEFAULT_PBKDF2_ITER) {
  if (!salt || !Buffer.isBuffer(salt)) salt = Buffer.from(String(salt || ""), "utf8");
  const key = await pbkdf2Async(password, salt, iterations, PBKDF2_KEYLEN, "sha256");
  return Buffer.from(key);
}

/**
 * deriveKeyScrypt(password, salt, params = DEFAULT_SCRYPT_PARAMS)
 * returns Buffer (keylen bytes)
 */
async function deriveKeyScrypt(password, salt, params = DEFAULT_SCRYPT_PARAMS) {
  if (!salt || !Buffer.isBuffer(salt)) salt = Buffer.from(String(salt || ""), "utf8");
  const { N, r, p, keylen } = params;
  // Node's scrypt accepts options as maxmem; here we just use promisified scrypt with keylen:
  const key = await scryptAsync(password, salt, keylen, { N, r, p });
  return Buffer.from(key);
}

/**
 * sync variants if you need them (blocking):
 */
function deriveKeyPBKDF2Sync(password, salt, iterations = DEFAULT_PBKDF2_ITER) {
  if (!salt || !Buffer.isBuffer(salt)) salt = Buffer.from(String(salt || ""), "utf8");
  return crypto.pbkdf2Sync(password, salt, iterations, PBKDF2_KEYLEN, "sha256");
}

function deriveKeyScryptSync(password, salt, keylen = 32) {
  if (!salt || !Buffer.isBuffer(salt)) salt = Buffer.from(String(salt || ""), "utf8");
  return crypto.scryptSync(password, salt, keylen);
}

module.exports = {
  deriveKeyPBKDF2,
  deriveKeyScrypt,
  deriveKeyPBKDF2Sync,
  deriveKeyScryptSync,
  DEFAULT_PBKDF2_ITER,
  DEFAULT_SCRYPT_PARAMS
};
