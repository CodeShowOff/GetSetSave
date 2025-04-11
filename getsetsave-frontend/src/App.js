import React, { useState, useEffect } from "react";
import "./App.css";

import Header from "./components/Header";
import InputSection from "./components/InputSection";
import Spinner from "./components/Spinner";
import VideoPreview from "./components/VideoPreview";
import Footer from "./components/Footer";
// ...inside return(), after all sections:



function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}


function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      setError("❌ Please enter a video URL.");
      return;
    }

    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|twitter\.com|instagram\.com)\/.+$/i;
    if (!urlPattern.test(videoUrl.trim())) {
      setError("❌ Unsupported or invalid URL. Try YouTube, Twitter, or Instagram.");
      return;
    }

    setError("");
    setIsLoading(true);
    setVideoData(null);

    try {
      const res = await fetch("http://localhost:5000/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("❌ " + (data.error || "Failed to fetch video info"));
        setIsLoading(false);
        return;
      }

      // Format video data for your VideoPreview component
      const formattedData = {
        title: data.title,
        thumbnail: data.thumbnail || data.thumbnails?.[0]?.url,
        duration: data.duration_string || formatDuration(data.duration),
        formats: data.formats
          .filter(f => f.url && f.filesize)
          .map(f => ({
            quality: f.format_note || f.resolution || "Unknown",
            type: f.ext.toUpperCase(),
            kind: f.vcodec === "none" ? "Audio" : "Video", // 👈 check if it's audio-only
            size: formatBytes(f.filesize),
            link: f.url
          }))
      };

      setVideoData(formattedData);
    } catch (err) {
      setError("⚠️ Network error. Make sure the backend is running.");
    }

    setIsLoading(false);
  };


  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setVideoUrl(text);
      setError("");
    } catch (err) {
      setError("⚠️ Unable to access clipboard. Paste manually.");
    }
  };

  // ⌨️ Add Ctrl+V paste support
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        handlePasteFromClipboard();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  // 🖱️ Add drag-and-drop support
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData("text/plain");
    setVideoUrl(droppedText);
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className={`App ${darkMode ? "dark" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Header darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />

      <InputSection
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        handleDownload={handleDownload}
        handlePasteFromClipboard={handlePasteFromClipboard}
        isLoading={isLoading}
      />

      {/* 💡 UX Tip */}
      <small className="tip-text">
        💡 Tip: Press <strong>Ctrl+V</strong> to paste or drag a link onto the page
      </small>


      {error && <div className="error">{error}</div>}
      {isLoading && <Spinner />}
      {videoData && <VideoPreview videoData={videoData} />}

      <Footer darkMode={darkMode} />
    </div>
  );
}

export default App;
