import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdClose, MdLogout, MdMenu, MdSettings } from "react-icons/md";
import { assets } from "../../assets/assets";
import DriverNotifications from '../DriverNotifications/DriverNotifications'
import "./Navbar.css";

const Navbar = () => {
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const profileRef = useRef(null);
  const [showMenuLinks, setShowMenuLinks] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Toggle the dropdown visibility
  const toggleProfile = () => {
    setShowProfileDetails((prev) => !prev);
  };
  const toggleMenu = () =>{
    setShowMenuLinks((prev)=>!prev);
  }

  const driverName = localStorage.getItem("driverName") || "Driver";
  const driverImageUrl = localStorage.getItem("driverImageUrl") || "/driver.jpeg";

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("driverId");
    localStorage.removeItem("driverName");
    localStorage.removeItem("driverImageUrl");
    localStorage.removeItem("driverNotifications");
    sessionStorage.removeItem("token");
    window.location.href = "/";
  };

  // Close the dropdown if a click happens outside the profile section
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && menuRef && !menuRef.current.contains(event.target) && !profileRef.current.contains(event.target)) {
        setShowProfileDetails(false);
        setShowMenuLinks(false);
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
          <img className="navbar__logo" src="/TT-logo.png" alt="Logo" />
        </Link>
      </div>

      <div className="navbar__center">
      <ul>
              <li>
                <a href="/dashboard">Dashboard</a>
              </li>
              <li>
                <a href="/history">History</a>
              </li>
              <li>
                <a href="/earnings">Earnings</a>
              </li>
              <li>
                <a href="/support">Support</a>
              </li>
            </ul>
 
      </div>
      <button onClick={()=>navigate("/create-ride")}>Post a Ride</button>

      <div className="navbar__right" ref={profileRef}>
      <DriverNotifications/>
        <div className="profile">
        <img
          onClick={toggleProfile}
          className="navbar__profile"
          src={driverImageUrl}
          alt="Admin Profile"
        />
        <p style={{color:"#fff"}}>{driverName}</p>
        </div>
        {showProfileDetails && (
          <div className="navbar__dropdown">
            <h2>
              Contact Me
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
              <MdSettings style={{width:30,height:30}} onClick={()=>navigate('/profile-settings')}/>
              </li>
            </ul>
          </div>
        )}

      </div>
      <div className="toggle-menu" onClick={()=>toggleMenu()} ref={menuRef}>
        <MdMenu style={{color:"#fff", width:30,height:30, float:"right"}}/>
        {showMenuLinks && (
          <div className="navbar_menuLinks">
          <MdClose style={{width:25, height:25, cursor:"pointer"}}/>
          <button className="btn-create" onClick={()=>navigate("/create-ride")}>Creat New Ride</button>
            <h2>
              Menu
            </h2>
            <ul>
              <li>
                <a href="/dashboard">Dashboard</a>
              </li>
              <hr />
              <li>
                <a href="/history">History</a>
              </li>
              <hr />
              <li>
                <a href="/earnings">Earnings</a>
              </li>
              <hr />
              <li>
                <a href="/support">Support</a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
