// src/system/fileManager.js
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const { pipeline } = require("stream/promises");
const os = require("os");
const crypto = require("crypto");

const { parseMetadata, buildMetadata } = require("./metadata");

/**
 * Ensure that the directory for a given file exists.
 * Creates parents as needed.
 */
async function ensureDirExists(filePath) {
  const dir = path.dirname(filePath);
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore if already exists
    if (e.code !== "EEXIST") throw e;
  }
}

/**
 * Atomic move (rename). If rename fails across devices, fallback to copy+unlink.
 */
async function atomicMove(src, dest) {
  try {
    await ensureDirExists(dest);
    await fsp.rename(src, dest);
  } catch (err) {
    // cross-device rename fallback
    if (err.code === "EXDEV") {
      await pipeline(fs.createReadStream(src), fs.createWriteStream(dest));
      await safeUnlink(src);
    } else {
      throw err;
    }
  }
}

/**
 * Safe unlink (best-effort).
 */
async function safeUnlink(filePath) {
  try {
    await fsp.unlink(filePath);
  } catch (e) {
    // ignore not found, else rethrow
    if (e.code !== "ENOENT") {
      // don't throw to keep best-effort behavior
    }
  }
}

/**
 * Create a unique temporary file path in the system temp directory.
 */
function makeTempFilePath(prefix = "ciphervlt") {
  const name = `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  return path.join(os.tmpdir(), name);
}

/**
 * Prepend metadata header to a ciphertext file.
 *
 * Steps:
 *  - Read tempCipherPath (raw ciphertext)
 *  - Create finalOutputPath (write header + pipe ciphertext)
 *  - Write atomically by first writing to tmp file in same dir then rename
 *
 * @param {string} tempCipherPath - path to temporary raw ciphertext file
 * @param {string} finalOutputPath - path to write final .enc file
 * @param {Buffer} metadataBuffer - metadata header (binary)
 */
async function prependMetadataToCipher(tempCipherPath, finalOutputPath, metadataBuffer) {
  if (!metadataBuffer || !Buffer.isBuffer(metadataBuffer)) {
    throw new Error("metadataBuffer must be a Buffer");
  }

  // create a tmp file in the destination folder for atomicity
  const destDir = path.dirname(finalOutputPath);
  await ensureDirExists(destDir);

  const tmpPath = makeTempFilePath("enc-out");
  const tmpStream = fs.createWriteStream(tmpPath, { flags: "w" });

  // write header first
  await new Promise((res, rej) => {
    tmpStream.write(metadataBuffer, (err) => (err ? rej(err) : res()));
  });

  // append ciphertext by streaming from tempCipherPath -> tmpPath
  try {
    await pipeline(fs.createReadStream(tempCipherPath), fs.createWriteStream(tmpPath, { flags: "a" }));
  } catch (err) {
    // cleanup tmp if pipeline failed
    await safeUnlink(tmpPath);
    throw err;
  }

  // atomic move into final destination
  await atomicMove(tmpPath, finalOutputPath);

  // cleanup the original tempCipherPath
  await safeUnlink(tempCipherPath);

  return true;
}

/**
 * Parse metadata from an encrypted file and extract the ciphertext into a temp file.
 *
 * Reads the header (small) synchronously/asynchronously then streams the remaining bytes
 * (ciphertext) into destCipherPath which is returned. Also returns parsed metadata.
 *
 * @param {string} encryptedPath - path to .enc file
 * @param {string} destCipherPath - path to write raw ciphertext (temporary)
 * @returns {Promise<{salt:Buffer, iv:Buffer, authTag:Buffer, originalExtension:string, metaSize:number, cipherPath:string}>}
 */
async function extractMetadataAndStreamCipher(encryptedPath, destCipherPath = null) {
  // read first small chunk to parse header
  const fd = await fsp.open(encryptedPath, "r");
  try {
    // read first 4096 bytes (should be plenty for header)
    const headerBuf = Buffer.alloc(4096);
    const { bytesRead } = await fd.read(headerBuf, 0, headerBuf.length, 0);
    const hdrSlice = headerBuf.slice(0, bytesRead);

    // parse metadata
    const meta = parseMetadata(hdrSlice); // may throw if header incomplete/invalid
    const { metaSize, salt, iv, authTag, originalExtension } = meta;

    // prepare destination temp path if not provided
    const cipherTemp = destCipherPath || makeTempFilePath("cipher-raw");

    // stream ciphertext portion (from metaSize to EOF) to cipherTemp
    const readStream = fs.createReadStream(encryptedPath, { start: metaSize });
    const writeStream = fs.createWriteStream(cipherTemp, { flags: "w" });

    await pipeline(readStream, writeStream);

    return {
      salt,
      iv,
      authTag,
      originalExtension,
      metaSize,
      cipherPath: cipherTemp
    };
  } finally {
    await fd.close();
  }
}

/**
 * Read metadata only (without extracting ciphertext).
 * Useful for quick checks.
 * @param {string} encryptedPath
 * @returns {Promise<{salt:Buffer, iv:Buffer, authTag:Buffer, originalExtension:string, metaSize:number}>}
 */
async function readMetadataOnly(encryptedPath) {
  const fd = await fsp.open(encryptedPath, "r");
  try {
    const headerBuf = Buffer.alloc(4096);
    const { bytesRead } = await fd.read(headerBuf, 0, headerBuf.length, 0);
    const hdrSlice = headerBuf.slice(0, bytesRead);
    const meta = parseMetadata(hdrSlice);
    return meta;
  } finally {
    await fd.close();
  }
}

module.exports = {
  ensureDirExists,
  prependMetadataToCipher,
  extractMetadataAndStreamCipher,
  readMetadataOnly,
  atomicMove,
  safeUnlink,
  makeTempFilePath
};
