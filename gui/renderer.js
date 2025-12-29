const startBtn = document.getElementById("startBtn");
const statusLog = document.getElementById("statusLog");
const dropZone = document.getElementById("dropZone");
const dropText = document.getElementById("dropText");
const fileInput = document.getElementById("filePicker");

// Disable browser file input
fileInput.style.display = "none";

let selectedFilePath = null;

function log(msg) {
  statusLog.textContent += msg + "\n";
}

// File picker (Electron)
dropZone.addEventListener("click", async () => {
  const filePath = await window.cipherVault.pickFile();
  if (filePath) {
    selectedFilePath = filePath;
    dropText.textContent = filePath.split(/[\\/]/).pop();
  }
});

// Start process
startBtn.addEventListener("click", async () => {
  statusLog.textContent = "";

  try {
    if (!selectedFilePath) {
      throw new Error("No file selected.");
    }

    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm")?.value || null;
    const mode = new URLSearchParams(window.location.search).get("mode");

    log("Processing...");

    const result =
      mode === "encrypt"
        ? await window.cipherVault.encrypt({
            filePath: selectedFilePath,
            password,
            confirmPassword: confirm,
          })
        : await window.cipherVault.decrypt({
            filePath: selectedFilePath,
            password,
          });

    if (!result.ok) {
      log("Error: " + result.message);
      return;
    }

    log("Process completed successfully.");
  } catch (err) {
    log("Error: " + err.message);
  }
});
