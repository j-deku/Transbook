import React from "react";
import './Fleets.css'
import {useNavigate} from "react-router-dom"

const Fleets = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="car-show-list">
        <h1>Service Fleet</h1>
        <div className="car-show">
          <img src="/car-budget.jpeg" />
            <p>Compact, Versatile, and Ideal for Shorter Journeys<br/>
Our van fleet is perfect for small groups or solo travelers seeking convenience and flexibility. Each van comes with:<br/><br/>
<b>Comfortable Seating:</b> Ergonomic seats with spacious interiors, ensuring a relaxed ride.<br/><br/>
<button onClick={()=>navigate("/searchRides")}>Book Now</button>
</p>
        </div>
      </div>
    </div>
  );
};

export default Fleets;
