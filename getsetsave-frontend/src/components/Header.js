// src/components/Header.js

import React from "react";
import "./Header.css"; // optional for styling

function Header({ darkMode, toggleTheme }) {
    return (
        <header className="header">
            <h1>
                GetSetSave <span className="signature">by CodeShowOff</span>
            </h1>

            <button onClick={toggleTheme}>
                {darkMode ? "🌙 Dark" : "☀️ Light"}
            </button>
        </header>
    );
}

export default Header;