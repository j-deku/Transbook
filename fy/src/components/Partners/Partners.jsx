import React from "react";
import "./Partners.css";
import { useNavigate } from "react-router-dom";

const Partners = () => {
  const navigate = useNavigate();

  return (
    <div className="partners">
      <h2>Drive with TOLI-TOLI</h2>
      <div className="container">
        <img src="/traveler10.jpeg" alt="" />
        <div className="container2">
        <b>Arrive Safely</b>
        <p>
        Comfort & Convenience:Experience comfort, affordability, and ease in every ride.
        On-Demand Transport: Your fast, on-demand ride, ready when you are.

        Smart Commutes: Ride smart with seamless booking and real-time tracking.<br/><br/>
      <button type="button" onClick={()=>navigate("/searchRides")} title="searchrides">Book Now</button>
    </p>
        </div>
      </div>

      <div className="container">
        <div className="container3">
        <b>Transfers</b>
        <p>
        <strong>Smart Commutes:</strong> Ride smart with seamless booking and real-time tracking.
Efficient Service: Efficient, safe, and reliable transport to suit your busy schedule.
Professional Transfers:Professional drivers, modern vehicles, and a hassle-free journey.</p>
        </div>
        <img src="/traveler3.jpg" alt="" />
      </div>

      <br />
      <div className="container">
        <img src="/traveler8.jpeg" alt="" />
        <div className="container4">
        <b>Support Teams</b>
        <p>
<b>Route sharing</b><br/>
Share a link, and the others will see your location
SOS-button
One button for emergency services
24/7 support
Our team of specialists will assist you any time day and night
Verified drivers
The drivers undergo rigorous screening before the first drive<br/>
<em>⭐⭐⭐⭐⭐</em>
</p>
        </div>
      </div>
      <br />
    </div>
  );
};

export default Partners;
