// src/utils/progress.js

const fs = require("fs");
const chalk = require("chalk");

function showProgressBar(label, current, total) {
    const percent = Math.floor((current / total) * 100);
    const barLength = 30;

    const filled = Math.floor((percent / 100) * barLength);
    const empty = barLength - filled;

    process.stdout.write(
        `\r${chalk.blue(label)} [${"█".repeat(filled)}${" ".repeat(empty)}] ${percent}%`
    );
}

/**
 * Wraps a read stream and reports progress
 */
function trackProgress(inputPath, label = "Processing") {
    const total = fs.statSync(inputPath).size;
    let processed = 0;

    const stream = fs.createReadStream(inputPath);

    stream.on("data", (chunk) => {
        processed += chunk.length;
        showProgressBar(label, processed, total);
    });

    stream.on("end", () => {
        console.log("\n" + chalk.green("✔ Completed"));
    });

    return stream;
}

module.exports = {
    trackProgress,
    showProgressBar
};
