import React from "react";

function InputSection({
    videoUrl,
    setVideoUrl,
    handleDownload,
    handlePasteFromClipboard,
    isLoading,
}) {
    return (
        <div className="input-section">
            <input
                type="text"
                placeholder="Paste video URL here..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
            />
            <button onClick={handleDownload} disabled={isLoading}>
                {isLoading ? "Loading..." : "Download"}
            </button>
            <button onClick={handlePasteFromClipboard}>📋 Paste</button>
        </div>
    );
}

export default InputSection;
