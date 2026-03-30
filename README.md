# 🔐 CipherVault GUI

Secure File Encryption System (Node.js + Electron)

---

## 📌 Overview

CipherVault GUI is a desktop application that allows users to securely encrypt and decrypt files using modern cryptographic standards.

The system uses:

* **AES-256-GCM** (for encryption + integrity)
* **PBKDF2 / scrypt** (for key derivation)
* **Electron** (for GUI)
* **Node.js** (for cryptographic engine)

The application runs **fully offline** — no internet, no cloud.

---

## 🚀 How to Run (VERY IMPORTANT)

### 1. Clone the project

```bash
git clone https://github.com/adeyinkamary/CipherVaultGui.git
cd CipherVaultGui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the application

```bash
npm run start
```

✅ This will open the desktop app (GUI)

---

## 🧭 How the App Works

### Encrypt

1. Select file
2. Enter password
3. Click Encrypt
4. File is encrypted

### Decrypt

1. Select encrypted file
2. Enter password
3. Click Decrypt
4. File is restored

---

## 🏗️ System Structure 

### 🔹 1. Electron Layer (GUI)

Handles the interface

* `main.js` → Starts the app window
* `preload.js` → Secure bridge (frontend ↔ backend)
* `renderer.js` → Frontend logic
* `assets/*.html` → images

---

### 🔹 2. Controllers (Main Logic)

Handles user actions

* `encryptController.js` → Controls encryption process
* `decryptController.js` → Controls decryption process

---

### 🔹 3. Core (Security Engine)

This is the heart of your system

* `aesEncrypt.js` → Encrypts data
* `aesDecrypt.js` → Decrypts data
* `keyDerivation.js` → Converts password → key
* `cryptoUtils.js` → Random bytes, wiping memory
* `integrity.js` → Handles authentication

---

### 🔹 4. System (File Handling)

* `fileManager.js` → Reads/writes files
* `metadata.js` → Stores salt, IV, algorithm
* `backupManager.js` → Handles file safety

---

### 🔹 5. Utils (Helpers)

* `validation.js` → Checks input
* `entropy.js` → Password strength
* `progress.js` → Operation tracking

---

## 🔐 Encryption Design

Algorithm used:

* **AES-256-GCM**

Security components:

* Salt → 16 bytes
* IV → 12 bytes
* Key → 256-bit

### File Structure:

```
[METADATA] :: [CIPHERTEXT + AUTH TAG]
```

---

## 🛡️ Security Features

* No password is stored
* Unique salt per encryption
* Unique IV per encryption
* Authentication tag prevents tampering
* Keys wiped from memory
* Fully offline system

---

## 🧪 Testing

Tested with:

* .txt, .pdf, .jpg, .zip, .mp3
* Large files (100MB+)
* Wrong password
* Corrupted file

✅ All tests passed

---

## ⚠️ Limitations

* No password recovery
* Windows-focused
* No cloud sync

---

## 🔮 Future Improvements

* Cross-platform support
* Batch encryption
* Drag & drop UI
* Secure delete (file shredding)

---

## 👨‍💻 Author

Adeyinka Success Omotorera
University of Roehampton
