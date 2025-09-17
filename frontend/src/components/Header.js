import React from "react";
import "./Header.css";

function Header({ darkMode, toggleTheme }) {
  return (
    <header className="header" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <h1 style={{ margin: 0 }}>
        GetSetSave <span className="signature">by CodeShowOff</span>
      </h1>

      <div style={{ marginLeft: "auto" }}>
        <button
          onClick={toggleTheme}
          aria-pressed={darkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </header>
  );
}

export default Header;