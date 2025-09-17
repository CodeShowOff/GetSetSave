// scripts/install-yt-dlp.js
// Downloads yt-dlp into ./bin in the project. Cross-platform (Windows -> yt-dlp.exe, Unix -> yt-dlp).
// Usage: node ./scripts/install-yt-dlp.js

const https = require("https");
const fs = require("fs");
const path = require("path");

const BIN_DIR = path.join(__dirname, "..", "bin");
const isWin = process.platform === "win32";
const filename = isWin ? "yt-dlp.exe" : "yt-dlp";
const destPath = path.join(BIN_DIR, filename);

// GitHub "latest release" direct-download URLs
const urls = {
  win: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
  unix: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"
};

const url = isWin ? urls.win : urls.unix;

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed: ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest, { mode: 0o755 });
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve());
      });
      file.on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
    });

    request.on("error", (err) => {
      reject(err);
    });
  });
}

(async () => {
  try {
    console.log(`Installing yt-dlp into ${destPath}`);
    mkdirp(BIN_DIR);

    // if file already exists, do a quick skip (or overwrite if you prefer)
    if (fs.existsSync(destPath)) {
      console.log("yt-dlp already exists in bin/. Skipping download. To force re-download delete bin/yt-dlp* and run again.");
      process.exit(0);
    }

    await download(url, destPath);

    // On Unix, ensure executable bit is set
    if (!isWin) {
      fs.chmodSync(destPath, 0o755);
    }

    console.log("yt-dlp installed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to install yt-dlp:", err.message || err);
    process.exit(1);
  }
})();
