// src/controllers/modeManager.js

/**
 * CipherVault Security Modes
 *
 * FAST   → Quick encryption, lower PBKDF2 iterations
 * SECURE → Recommended mode, strong PBKDF2 + safe defaults
 * ULTRA  → Maximum security using scrypt + big salt + slow derivation
 */

const modes = {
    fast: {
        name: "FAST MODE",
        pbkdf2Iterations: 50000,
        keyLength: 32,
        saltSize: 16,
        ivSize: 16,
        useScrypt: false,
        secureDelete: false,
        createBackup: false
    },

    secure: {
        name: "SECURE MODE",
        pbkdf2Iterations: 200000,
        keyLength: 32,
        saltSize: 32,
        ivSize: 16,
        useScrypt: false,
        secureDelete: true,     // securely wipe original plaintext
        createBackup: true      // backup original before delete
    },

    ultra: {
        name: "ULTRA MODE",
        useScrypt: true,         // replaces PBKDF2
        scryptParams: {
            N: 16384,
            r: 8,
            p: 1
        },
        keyLength: 32,
        saltSize: 64,            // very strong
        ivSize: 16,
        secureDelete: true,
        createBackup: true
    }
};

function getMode(modeName = "secure") {
    const selected = modes[modeName.toLowerCase()];

    if (!selected) {
        throw new Error(
            `Invalid mode: ${modeName}. Use fast | secure | ultra`
        );
    }

    return selected;
}

module.exports = {
    getMode
};
