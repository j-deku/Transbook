import { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import ToggleTheme from "../ToggleTheme/ToggleTheme";
import { StoreContext } from "../../context/StoreContext";
import { useTranslation } from "react-i18next";
import {
  FaBell,
  FaBoxOpen,
  FaCartPlus,
  FaShoppingBag,
  FaDoorOpen,
  FaSearch,
} from "react-icons/fa";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { Badge, IconButton } from "@mui/material";
import LanguageModal from "../LanguageModal/LanguageModal";
import ReactCountryFlag from "react-country-flag";

const Navbar = ({ setLogin }) => {
  const { token, user, setUser, setToken, cartItems } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;

  // State for language modal
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
    setToken("");
    setUser({});
    navigate("/");
  };

  const [menu, setMenu] = useState("Home");
  const [show, setShow] = useState(false);
  const sidebarRef = useRef(null);

  const showHamContent = () => setShow(!show);
  const clickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const clickLink = () => setShow(false);
  const handleSearchInput = () => navigate("/searchInput");

  // Map language codes to country codes for flags
  const languageCountryMap = {
    en: 'US',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
    it: 'IT',
    pt: 'PT',
    zh: 'CN',
    ja: 'JP',
    ru: 'RU',
    ar: 'SA',
    hi: 'IN',
    ko: 'KR',
    nl: 'NL',
    sv: 'SE',
    tr: 'TR'
  };

  const currentCountryCode = languageCountryMap[i18n.language] || 'US';

  return (
    <div className={`navbar ${isScrolled ? "scroll-active" : "scroll-inactive"}`} id="navbar">
      <Link to="/">
        <div className="logo"><em>TOLI-TOLI</em></div>
      </Link>
      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu("Home")} className={menu === "Home" ? "active" : ""}>
          {t("navbar.home")}
        </Link>
        <a href="#explore-menu" onClick={() => setMenu("Menu")} className={menu === "Menu" ? "active" : ""}>
          {t("navbar.menu")}
        </a>
        <a href="#app-download" onClick={() => setMenu("Mobile-App")} className={menu === "Mobile-App" ? "active" : ""}>
          {t("navbar.mobileApp")}
        </a>
        <a href="#footer" onClick={() => setMenu("Contact-Us")} className={menu === "Contact-Us" ? "active" : ""}>
          {t("navbar.contactUs")}
        </a>
      </ul>
      <div className="navbar-right">
        <FaSearch onClick={handleSearchInput} className="searchImage" style={{ color: "#fff", width: "30px", height: "30px" }} />
        <div className="navbar-search-icon">
          <Link to="/cart">
            <Badge badgeContent={cartCount} color="error">
              {cartCount > 0 ? (
                <FaShoppingBag style={{ color: "#fff", width: "30px", height: "30px" }} />
              ) : (
                <FaCartPlus style={{ color: "#fff", width: "30px", height: "30px" }} />
              )}
            </Badge>
          </Link>
        </div>
        <ToggleTheme className="themeButton" />
        {/* Language switcher trigger */}
        <div style={{marginRight:10, marginLeft:10}}>
        <IconButton 
  onClick={() => setLanguageModalOpen(true)} 
  disableRipple
  disableFocusRipple
  sx={{ 
    width: 50, 
    height: 50, 
    borderRadius: '50%', 
    backgroundColor: 'transparent', 
    minWidth: 0,
    p: 0,
    // Remove all borders, outlines and shadows on default, hover, focus, and active states
    border: 'none !important',
    boxShadow: 'none !important',
    outline: 'none !important',
    '&:hover': { 
      backgroundColor: 'transparent !important',
      border: 'none !important',
      boxShadow: 'none !important',
      outline: 'none !important',
    },
    '&:focus': {
      backgroundColor: 'transparent !important',
      border: 'none !important',
      boxShadow: 'none !important',
      outline: 'none !important',
    },
    '&.Mui-focusVisible': {
      backgroundColor: 'transparent !important',
      border: 'none !important',
      boxShadow: 'none !important',
      outline: 'none !important',
    },
    '&:active': {
      backgroundColor: 'transparent !important',
      border: 'none !important',
      boxShadow: 'none !important',
      outline: 'none !important',
    }
  }}
>
  <ReactCountryFlag 
    countryCode={currentCountryCode}
    svg
    style={{ width: '2em', height: '2em', borderRadius: '50%' }}
    title={i18n.language.toUpperCase()}
  />
</IconButton>
        </div>
        <LanguageModal open={languageModalOpen} onClose={() => setLanguageModalOpen(false)} />
        {!token ? (
          <button onClick={() => setLogin(true)}>{t("navbar.signIn")}</button>
        ) : (
          <>
            <div className="navbar-profile">
              {user && user.avatar ? (
                <img src={user.avatar} alt="User" className="profile-picture" />
              ) : (
                <PersonIcon style={{ fontSize: "25px", color: "#fff" }} />
              )}
              <ul className="navbar-profile-dropdown">
                <li onClick={() => navigate("/profile")}>
                  <PersonIcon style={{ color: "black" }} />
                  <p>{t("navbar.profile")}</p>
                </li>
                <hr />
                <li onClick={() => navigate("/newsFeed")}>
                  <FaBell style={{ color: "black" }} />
                  <p>{t("navbar.notifications")}</p>
                </li>
                <hr />
                <li onClick={() => navigate("/myBookings")}>
                  <FaBoxOpen style={{ color: "black" }} />
                  <p>{t("navbar.bookings")}</p>
                </li>
                <hr />
                <li onClick={logout}>
                  <FaDoorOpen style={{ color: "black" }} />
                  <p>{t("navbar.logout")}</p>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hamburger">
        <MenuIcon onClick={showHamContent} className="MenuIcon" sx={{ color: "#fff", fontSize: 55, cursor: "pointer", height:40, width:40 }} />
        <div className={`sidebar-overlay ${show ? "show" : "hide"}`} ref={sidebarRef}></div>
        <div ref={sidebarRef} className={`hamburger-content ${show ? "show" : "hide"}`}>
          <CloseIcon onClick={clickLink} className="closeHamburger" sx={{ cursor: "pointer", fontSize: 35 }} />
          <a onClick={clickLink} href="/">{t("navbar.home").toUpperCase()}</a>
          <a onClick={clickLink} href="#explore-menu">{t("navbar.menu").toUpperCase()}</a>
          <a onClick={clickLink} href="#app-download">{t("navbar.mobileApp").toUpperCase()}</a>
          <a onClick={clickLink} href="#footer">{t("navbar.contactUs").toUpperCase()}</a>
          {!token ? (
            <button onClick={() => (setLogin(true) ? clickLink : "")} className="signIn">
              {t("navbar.signIn")}
            </button>
          ) : (
            <div className="navbar-profile">
              <PersonIcon sx={{ fontSize: "50px" }} className="userIcon" />
              <h1 style={{ fontFamily: "Poppins,sans-serif", fontWeight: "bold" }}>
                {user && user.name ? user.name : t("navbar.welcome")}!
              </h1>
            </div>
          )}
          <hr />
          <p>{t("navbar.changeTheme") || "Change Theme:"}</p>
          <ToggleTheme className="themeButton" />
        </div>
      </div>
    </div>
  );
};

Navbar.propTypes = {
  setLogin: PropTypes.func.isRequired,
};

export default Navbar;
