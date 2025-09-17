import React from "react";
import "./Footer.css";
import { FaInstagram, FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

function Footer({ darkMode }) {
    return (
    <footer className={`footer ${darkMode ? "dark" : ""}`}>
      <div className="footer-inner">
        <div className="footer-left" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src={`${process.env.PUBLIC_URL || ""}/your-logo.png`} alt="Your logo" className="logo" />
          <span>© {new Date().getFullYear()} CodeShowOff</span>
        </div>

        <div className="footer-right">
          <a href="https://github.com/CodeShowOff" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
          <a href="https://linkedin.com/in/codeshowoff" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
          <a href="https://www.instagram.com/codeshowoff/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          <a href="https://x.com/CodeShowOff" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
        </div>
      </div>
    </footer>
  );

}

export default Footer;
