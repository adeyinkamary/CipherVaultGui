// src/system/metadata.js
// Handles building and parsing CipherVault encrypted file metadata.

const MAGIC = "CVLT";         // 4 bytes - file signature
const VERSION = 1;            // 1 byte for versioning

/**
 * Metadata format (binary):
 * [0-3]   MAGIC = "CVLT"
 * [4]     VERSION = 1
 * [5]     saltLength (1 byte)
 * [6..?]  salt
 * [..]    ivLength (1 byte)
 * [..]    iv
 * [..]    authTagLength (1 byte)
 * [..]    authTag
 * [..]    extLength (1 byte)
 * [..]    originalExtension (utf8)
 *
 * After this header, raw ciphertext bytes follow.
 */

/**
 * Build metadata Buffer
 */
function buildMetadata({ salt, iv, authTag, originalExtension }) {
    if (!salt || !iv || !authTag) {
        throw new Error("Missing metadata fields (salt/iv/authTag required).");
    }

    const ext = originalExtension?.replace(".", "") || "";
    const extBuf = Buffer.from(ext, "utf8");

    const header = Buffer.concat([
        Buffer.from(MAGIC),                       // 4 bytes
        Buffer.from([VERSION]),                   // 1 byte
        Buffer.from([salt.length]),               // 1 byte
        salt,                                     // salt
        Buffer.from([iv.length]),                 // 1 byte
        iv,                                       // iv
        Buffer.from([authTag.length]),            // 1 byte
        authTag,                                  // authTag
        Buffer.from([extBuf.length]),             // 1 byte
        extBuf                                    // extension
    ]);

    return header;
}

/**
 * Parse metadata from encrypted file buffer
 */
function parseMetadata(buffer) {
    let offset = 0;

    const magic = buffer.slice(offset, offset + 4).toString("utf8");
    if (magic !== MAGIC) throw new Error("Invalid CipherVault file (bad magic header).");
    offset += 4;

    const version = buffer.readUInt8(offset);
    offset += 1;
    if (version !== VERSION) {
        throw new Error(`Unsupported file version: ${version}`);
    }

    const saltLength = buffer.readUInt8(offset); offset += 1;
    const salt = buffer.slice(offset, offset + saltLength); offset += saltLength;

    const ivLength = buffer.readUInt8(offset); offset += 1;
    const iv = buffer.slice(offset, offset + ivLength); offset += ivLength;

    const authTagLength = buffer.readUInt8(offset); offset += 1;
    const authTag = buffer.slice(offset, offset + authTagLength); offset += authTagLength;

    const extLength = buffer.readUInt8(offset); offset += 1;
    const extension = buffer.slice(offset, offset + extLength).toString("utf8"); offset += extLength;

    return {
        metaSize: offset,
        salt,
        iv,
        authTag,
        originalExtension: extension ? `.${extension}` : ""
    };
}

module.exports = {
    buildMetadata,
    parseMetadata,
    MAGIC,
    VERSION
};
