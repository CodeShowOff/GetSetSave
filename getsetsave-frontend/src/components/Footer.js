// src/components/Footer.js

import React from "react";
import "./Footer.css";

import { FaInstagram, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

function Footer({ darkMode }) {
    return (
        <footer className={`footer ${darkMode ? "dark" : ""}`}>
            <div className="footer-left">
                <img src="/your-logo.png" alt="Your Logo" className="logo" />
                <span>© 2025 CodeShowOff</span>
            </div>

            <div className="footer-right">
                <a href="https://github.com/CodeShowOff" target="_blank" rel="noreferrer">
                    <FaGithub />
                </a>
                <a href="https://linkedin.com/in/codeshowoff" target="_blank" rel="noreferrer">
                    <FaLinkedin />
                </a>
                <a href="https://www.instagram.com/codeshowoff/" target="_blank" rel="noreferrer">
                    <FaInstagram />
                </a>
                <a href="https://x.com/CodeShowOff" target="_blank" rel="noreferrer">
                    <FaTwitter />
                </a>
            </div>
        </footer>
    );
}

export default Footer;

