import React from "react";
import "./VideoPreview.css";

export default function VideoPreview({ videoData }) {
  if (!videoData) return null;

  const audioFormats = (videoData.formats || []).filter(f => f.kind === "Audio");
  const videoFormats = (videoData.formats || []).filter(f => f.kind === "Video");

  return (
    <div className="video-preview" role="region" aria-label="Video information">
      <div className="video-thumbnail">
        {videoData.thumbnail ? (
          <img src={videoData.thumbnail} alt={`${videoData.title} thumbnail`} />
        ) : (
          <div style={{ height: "180px", background: "#ddd", borderRadius: 8 }}>No thumbnail</div>
        )}
      </div>

      <h2>{videoData.title}</h2>
      <p>Duration: {videoData.duration}</p>

      <div className="download-list">
        {videoFormats.length > 0 && (
          <>
            <h3>🎥 Video Formats</h3>
            {videoFormats.map((f, index) => (
              <div className="format-row" key={f.format_id || index}>
                <span>
                  🎥 {f.quality} ({f.type}, {f.size}) {f.hasAudio ? "🔊" : "🔇"}
                </span>
                <a href={f.link} target="_blank" rel="noopener noreferrer">
                  <button>Download</button>
                </a>
              </div>
            ))}
          </>
        )}

        {audioFormats.length > 0 && (
          <>
            <h3>🎧 Audio Formats</h3>
            {audioFormats.map((f, index) => (
              <div className="format-row" key={f.format_id || index}>
                <span>🎧 {f.quality} ({f.type}, {f.size})</span>
                <a href={f.link} target="_blank" rel="noopener noreferrer">
                  <button>Download</button>
                </a>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
