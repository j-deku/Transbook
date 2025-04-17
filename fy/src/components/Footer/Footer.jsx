import react from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import { Icon } from '@iconify/react';
import facebookIcon from "@iconify/icons-simple-icons/facebook";
import messengerIcon from "@iconify/icons-simple-icons/messenger";
import whatsappIcon from "@iconify/icons-simple-icons/whatsapp";
import linkedinIcon from "@iconify/icons-simple-icons/linkedin";
import twitterIcon from "@iconify/icons-simple-icons/x";

const Footer = () => {

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
      <Link to="/">
        <div className="logo"><em>TOLI-TOLI</em></div>
      </Link>          <p>
         <b>TOLI-TOLI – Book. Travel. Relax.</b><br/>
Seamless ride booking with secure payments and instant confirmations. Travel made easy!
          </p>
          <div className="footer-social-icons">
            <Link to="https://facebook.com" target="_blank">
            <Icon icon={facebookIcon} color="#1877F2" width="30" />
            </Link>
            <Link to="https://facebook.com" target="_blank">
            <Icon icon={messengerIcon} color="#fff" width="30" />
            </Link>
            <Link to="https://wa.me/+233544684595/" target="_blank">
            <Icon icon={whatsappIcon} color="#25D366" width="30" />
            </Link>
            <Link to="https://linkedin/jdeku-jdek" target="_blank">
            <Icon icon={linkedinIcon} color="#0077B5" width="30" />
            </Link>
            <Link to="https://twitter.com/jdeku-jdek" target="_blank">
            <Icon icon={twitterIcon} color="#fff" width="30" />
            </Link>
          </div>
        </div><hr className="stroke"/>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/aboutUs">About Us</Link>
            </li>
            <li>
              <Link to="/deliveryInfo">Delivery</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy</Link>
            </li>
            <li>
              <Link to="/message-us">Frequently Asked Questions</Link>
            </li>            
            <li>
              <Link to="/fleets">Our Fleets</Link>
            </li>            
            <li>
              <Link to="/partners">Partners or Affiliations</Link>
            </li>                              
          </ul>
        </div><hr className="stroke"/>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>
              <a href="tel:+233-246-062-758">🔗 +233-246-062-758</a>
            </li>
            <li>
              <a href="mailto:jdeku573@gmail.com">🔗 jdeku573@gmail.com</a>
            </li>
            <li>
              <a href="sms:+233246062758">🔗Chat via SMS</a>
            </li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        &copy; Inc. {new Date().getFullYear()} TOLI-TOLI. All Rights Reserved
      </p>
    </div>
  );
};

export default Footer;
