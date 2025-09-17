# GetSetSave — Video & Audio Downloader

A lightweight full-stack downloader for YouTube, X/Twitter, and Instagram. Paste a URL and pick formats. The UI also indicates whether each video format includes audio (🔊) or is video-only (🔇).

---

## Features

- Download video and audio via `yt-dlp`
- Multiple format options with size info
- Shows audio presence for video formats (🔊/🔇)
- Light/Dark mode, clipboard paste, drag & drop
- Mobile-friendly React UI

---

## Tech Stack

- Frontend: React (Create React App) + CSS
- Backend: Node.js + Express
- Media engine: `youtube-dl-exec` using `yt-dlp`

---

## Project Structure

```
GetSetSave/
├── bin/                     # yt-dlp binary (downloaded locally)
├── frontend/                # React app
│   ├── public/
│   └── src/
├── scripts/
│   └── install-yt-dlp.js    # Downloads yt-dlp into ./bin
├── server.js                # Express server (serves API + built frontend)
├── render.yaml              # Render deployment config
├── package.json             # root scripts (build/start both apps)
└── README.md
```

---

## Local Development

Prereqs: Node 18+ (Node 20 recommended) and npm.

1) Install server deps (postinstall will attempt to download yt-dlp to `bin/`):
```
npm install
```

2) Install frontend deps:
```
npm run install-frontend
```

3) Run both during development (two terminals):
```
# Terminal A — Express API with live reload
npm run dev

# Terminal B — CRA dev server (http://localhost:3000)
cd frontend && npm start
```

Notes:
- The frontend proxies API calls to `http://localhost:5000` (see `frontend/package.json` → `proxy`).
- If yt-dlp is not found, the server will try `./bin/yt-dlp` first, then `yt-dlp` on PATH. You can set `YT_DLP_BIN` to an absolute path if needed.

---

## Build and Run (single host)

1) Build the frontend:
```
npm run build-frontend
```

2) Start the server (serves `frontend/build` at `/`):
```
npm start
```

Open: `http://localhost:5000`

---

## Deploy on Render

This repo includes `render.yaml` for one-click deployment as a Web Service.

Key settings:
- Build Command:
```
npm ci && npm run install-frontend && npm run build-frontend
```
- Start Command:
```
npm start
```
- Environment Variables (recommended):
  - `NODE_VERSION` = `20`
  - `NODE_ENV` = `production`
  - Optional: `YT_DLP_BIN` (absolute path to a system-install of yt-dlp). If not set, the server uses `bin/yt-dlp` (downloaded during install) or `yt-dlp` on PATH.

If your Render image does not run `postinstall`, change Build Command to explicitly download yt-dlp:
```
npm ci && node ./scripts/install-yt-dlp.js && npm run install-frontend && npm run build-frontend
```

After the first deploy completes, open the Render-provided URL.

---

## Troubleshooting

- yt-dlp not found / `spawn ENOENT`:
  - Ensure `bin/yt-dlp` exists (re-run `node ./scripts/install-yt-dlp.js`) or install `yt-dlp` on PATH; or set `YT_DLP_BIN`.
- Some video formats have no audio:
  - The UI marks them with 🔇. Use a format with 🔊 if you need audio.

---

## Legal

Use this tool only for content you have rights to download. You are responsible for complying with the terms of the platforms you interact with and applicable laws.
