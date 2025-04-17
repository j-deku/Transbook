import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdLogout, MdSettings } from "react-icons/md";
import { assets } from "../../assets/assets";
import "./Navbar.css";

const Navbar = () => {
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const profileRef = useRef(null);

  // Toggle the dropdown visibility
  const toggleProfile = () => {
    setShowProfileDetails((prev) => !prev);
  };
const user = ()=>{
  return localStorage.getItem("adminEmail");
}
  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
    // Optionally, add Firebase logout or other cleanup logic here
  };

  // Close the dropdown if a click happens outside the profile section
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDetails(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <Link to="/dashboard">
          <img className="navbar__logo" src="/TT-logo.jpg" alt="Logo" />
        </Link>
      </div>

      <div className="navbar__center">
        <p>Welcome Back!</p>
        <p className="navbar__user">{user()}</p>
      </div>

      <div className="navbar__right" ref={profileRef}>
        <img
          onClick={toggleProfile}
          className="navbar__profile"
          src="./Jules-admin.jpg"
          alt="Admin Profile"
        />
        {showProfileDetails && (
          <div className="navbar__dropdown">
            <h2>
              <u>Contact Me</u>
            </h2>
            <ul>
              <li>
                <span>Call on: </span>
                <a href="tel:+233246062758">+233 246 062 758</a>
              </li>
              <hr />
              <li>
                <span>Whatsapp Line: </span>
                <a href="https://wa.me/+233544684595">0544684595</a>
              </li>
              <hr />
              <li>
                <span>Email: </span>
                <a href="mailto:fdeku573@gmail.com">fdeku573@gmail.com</a>
              </li>
              <hr />
              <li>
                <span>Send Message: </span>
                <a href="sms:+233246062758">✉ SMS</a>
              </li>
              <hr />
              <li className="navbar__logout">
                <span>Logout: </span>
                <MdLogout
                  onClick={logout}
                  style={{display:"flex",width:30,height:30, position:"relative"}}
                />
              </li>
              <li style={{float:"right",width:30, marginRight:40, alignItems:"center",height:30, top:-100, position:"relative"}}>
              <span>Settings:</span>
              <MdSettings style={{width:30,height:30}}/>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
