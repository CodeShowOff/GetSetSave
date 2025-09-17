import React from "react";

function InputSection({
  videoUrl,
  setVideoUrl,
  handleDownload,
  handlePasteFromClipboard,
  isLoading,
}) {
  return (
    <form className="input-section" onSubmit={handleDownload}>
      <input
        type="text"
        placeholder="Paste video URL here..."
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        aria-label="Video URL"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : "Fetch info"}
      </button>
      <button type="button" onClick={handlePasteFromClipboard} disabled={isLoading}>
        📋 Paste
      </button>
    </form>
  );
}

export default InputSection;
