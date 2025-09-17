// server.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const ytdlExec = require("youtube-dl-exec");

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------------------------------------------------------
// Choose which yt-dlp binary to use:
// 1) env override via YT_DLP_BIN
// 2) project-local ./bin/yt-dlp (or yt-dlp.exe on Windows)
// 3) 'yt-dlp' from PATH
// 4) fallback to package behavior
// -----------------------------------------------------------------------------
const isWin = process.platform === "win32";
const localBinName = isWin ? "yt-dlp.exe" : "yt-dlp";
const localBinPath = path.join(__dirname, "bin", localBinName);

let ytdl = ytdlExec; // default

try {
  const envBin = process.env.YT_DLP_BIN && fs.existsSync(process.env.YT_DLP_BIN) ? process.env.YT_DLP_BIN : null;

  if (envBin) {
    ytdl = ytdlExec.create(envBin);
    console.log("Using yt-dlp from YT_DLP_BIN:", envBin);
  } else if (fs.existsSync(localBinPath)) {
    ytdl = ytdlExec.create(localBinPath);
    console.log("Using project-local yt-dlp binary at", localBinPath);
  } else {
    // Try to use a system-installed 'yt-dlp' if present on PATH
    try {
      ytdl = ytdlExec.create("yt-dlp");
      console.log("Using yt-dlp from system PATH (yt-dlp).");
    } catch (e) {
      // fallback to default behaviour (ytdlExec)
      ytdl = ytdlExec;
      console.log("Falling back to package-bundled youtube-dl-exec behavior.");
    }
  }
} catch (err) {
  console.warn("Error selecting yt-dlp binary:", err && err.message ? err.message : err);
  ytdl = ytdlExec;
}

// -----------------------------------------------------------------------------
// Middlewares
// -----------------------------------------------------------------------------
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

// Allow CORS in dev; tighten in production if needed
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: true, credentials: true }));
}

// Rate limit for /api endpoints
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const ALLOWED_HOSTS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "twitter.com",
  "x.com",
  "instagram.com",
];

// validate URL hostname against allowed hosts (handles subdomains and www.)
function isValidUrl(urlString) {
  try {
    const u = new URL(urlString);
    const hostname = (u.hostname || "").toLowerCase().replace(/^www\./, "");
    return ALLOWED_HOSTS.some(h => hostname === h || hostname.endsWith("." + h));
  } catch (e) {
    return false;
  }
}

// Normalize formats to expected shape
function sanitizeInfo(info) {
  if (!info) return info;
  const out = { ...info };
  if (Array.isArray(out.formats)) {
    out.formats = out.formats.map(f => ({
      format_id: f.format_id ?? null,
      ext: f.ext ?? "unknown",
      format_note: f.format_note ?? null,
      resolution: f.resolution ?? null,
      filesize: typeof f.filesize === "number" ? f.filesize : null,
      url: f.url ?? null,
      vcodec: f.vcodec ?? null,
      acodec: f.acodec ?? null,
    }));
  }
  return out;
}

// -----------------------------------------------------------------------------
// API routes
// -----------------------------------------------------------------------------
app.post("/api/info", async (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "No URL provided" });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: "Unsupported or invalid URL" });
  }

  try {
    const YTDLP_TIMEOUT_MS = Number(process.env.YTDLP_TIMEOUT_MS) || 25_000;

    const infoPromise = ytdl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noWarnings: true,
      preferFreeFormats: true,
      // You can add more options here if desired
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout while fetching video info")), YTDLP_TIMEOUT_MS)
    );

    const raw = await Promise.race([infoPromise, timeoutPromise]);
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const sanitized = sanitizeInfo(parsed);

    return res.json(sanitized);
  } catch (err) {
    console.error("Error in /api/info:", err && err.stack ? err.stack : err);
    const msg = (err && err.message) ? err.message : "Failed to fetch info";
    return res.status(500).json({ error: msg });
  }
});

// small health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// -----------------------------------------------------------------------------
// Serve frontend (if built). Make sure API routes are above this.
// -----------------------------------------------------------------------------
const frontendBuildPath = path.join(__dirname, "frontend", "build");
app.use(express.static(frontendBuildPath));

// Prevent SPA catch-all from serving index.html for API paths
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).send("Not found");
  }
  const indexHtml = path.join(frontendBuildPath, "index.html");
  res.sendFile(indexHtml, err => {
    if (err) {
      res.status(404).send("Not found");
    }
  });
});

// -----------------------------------------------------------------------------
// Error handler (last middleware)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful-ish shutdown logging
process.on("SIGINT", () => {
  console.log("SIGINT received — shutting down.");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down.");
  process.exit(0);
});

// Start
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (env=${process.env.NODE_ENV || "development"})`);
});