// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

import Header from "./components/Header";
import InputSection from "./components/InputSection";
import Spinner from "./components/Spinner";
import VideoPreview from "./components/VideoPreview";
import Footer from "./components/Footer";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "Unknown";
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "Unknown";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const ALLOWED_HOSTS_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|twitter\.com|x\.com|instagram\.com)\/.+$/i;

function App() {
  // initialize theme from localStorage or system preference
  const stored = typeof window !== "undefined" ? localStorage.getItem("gss_theme") : null;
  const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialDark = stored ? stored === "dark" : prefersDark;

  const [videoUrl, setVideoUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(initialDark);

  // Ensure both body and root App element get the .dark class.
  useEffect(() => {
    const apply = (on) => {
      try {
        if (on) {
          document.body.classList.add("dark");
          document.documentElement.classList.add("dark");
        } else {
          document.body.classList.remove("dark");
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {
        // SSR or test environment may not have document
      }
    };
    apply(darkMode);
    // persist choice
    try {
      localStorage.setItem("gss_theme", darkMode ? "dark" : "light");
    } catch (e) { }
  }, [darkMode]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setVideoUrl(text);
        setError("");
      }
    } catch (err) {
      setError("⚠️ Unable to access clipboard. Paste manually.");
    }
  }, []);

  // keyboard paste support
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        handlePasteFromClipboard();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handlePasteFromClipboard]);

  // drag/drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData("text/plain");
    if (droppedText) {
      setVideoUrl(droppedText);
      setError("");
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleDownload = async (ev) => {
    if (ev && ev.preventDefault) ev.preventDefault();

    if (!videoUrl.trim()) {
      setError("❌ Please enter a video URL.");
      return;
    }

    if (!ALLOWED_HOSTS_REGEX.test(videoUrl.trim())) {
      setError("❌ Unsupported or invalid URL. Try YouTube, Twitter/X, or Instagram.");
      return;
    }

    setError("");
    setIsLoading(true);
    setVideoData(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        setError("❌ " + (errJson.error || "Failed to fetch video info"));
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const formats = Array.isArray(data.formats) ? data.formats : [];
      const formatted = {
        title: data.title || data.fulltitle || "Untitled",
        thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails[0] && data.thumbnails[0].url) || "",
        duration: data.duration_string || (typeof data.duration === "number" ? formatDuration(data.duration) : "Unknown"),
        formats: formats.map(f => ({
          format_id: f.format_id ?? null,
          quality: f.format_note || f.resolution || "Unknown",
          type: (f.ext || "unknown").toUpperCase(),
          kind: (f.vcodec === "none" ? "Audio" : "Video"),
          hasAudio: !!(f.acodec && f.acodec !== "none"),
          size: f.filesize ? formatBytes(f.filesize) : "Unknown",
          filesize: f.filesize ?? null,
          link: f.url ?? null
        })).filter(f => f.link)
      };

      setVideoData(formatted);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("⚠️ Request timed out while fetching video info.");
      } else {
        setError("⚠️ Network error. Make sure the backend is running.");
      }
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  return (
    <div className={`App ${darkMode ? "dark" : ""}`} onDrop={handleDrop} onDragOver={handleDragOver}>

      {/* header stays at top */}
      <Header darkMode={darkMode} toggleTheme={() => setDarkMode(d => !d)} />

      {/* centered content wrapper — keeps horizontal padding confined to page content */}
      <main className="content-wrapper">
        <InputSection
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          handleDownload={handleDownload}
          handlePasteFromClipboard={handlePasteFromClipboard}
          isLoading={isLoading}
        />

        <small className="tip-text">
          💡 Tip: Press <strong>Ctrl+V</strong> to paste or drag a link onto the page
        </small>

        {error && <div className="error" role="alert">{error}</div>}
        {isLoading && <Spinner />}
        {videoData && <VideoPreview videoData={videoData} />}
      </main>

      {/* footer remains a direct child of .App so it spans full width */}
      <Footer darkMode={darkMode} />
    </div>
  );

}

export default App;
