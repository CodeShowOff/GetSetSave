import React from "react";
import "./VideoPreview.css";

export default function VideoPreview({ videoData }) {
    const audioFormats = videoData.formats.filter(f => f.kind === "Audio");
    const videoFormats = videoData.formats.filter(f => f.kind === "Video");

    return (
        <div className="video-preview">
            <div className="video-thumbnail">
                <img src={videoData.thumbnail} alt="Video thumbnail" />
            </div>
            <h2>{videoData.title}</h2>
            <p>Duration: {videoData.duration}</p>

            <div className="download-list">
                {videoFormats.length > 0 && (
                    <>
                        <h3>🎥 Video Formats</h3>
                        {videoFormats.map((f, index) => (
                            <div className="format-row" key={index}>
                                <span>
                                    🎥 {f.kind} - {f.quality} ({f.type}, {f.size})
                                </span>
                                <a href={f.link} target="_blank" rel="noreferrer">
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
                            <div className="format-row" key={index}>
                                <span>
                                    🎧 {f.kind} - {f.quality} ({f.type}, {f.size})
                                </span>
                                <a href={f.link} target="_blank" rel="noreferrer">
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
