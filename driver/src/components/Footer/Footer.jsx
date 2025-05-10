import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="driver-footer">
    <div className="logo" onClick={()=>navigate("/")}>
        <img src="/TT-logo.png" alt="Logo" />
    </div>
      <nav className="footer-nav">
        <Link to="/history">Ride History</Link>
        <Link to="/earnings">Earnings Report</Link>
        <Link to="/profile-settings">Profile Settings</Link>
        <Link to="/support">Support</Link>
        <a href="tel:+233246062758">📞 Assistance</a>
      </nav>
      <div className="footer-info">
        <p>&copy; {new Date().getFullYear()} TOLI-TOLI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
