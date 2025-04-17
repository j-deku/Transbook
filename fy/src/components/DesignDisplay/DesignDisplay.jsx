import React from 'react';
import './DesignDisplay.css';
import {  FaCalendar, FaCoins, FaHeadset, FaShieldAlt} from 'react-icons/fa';
const DesignDisplay = () => {
  return (
    <div className="design-display" id="design-display">
      <h1>Why Choose Us </h1>
      <div className="design-display-list">
      <div className='card1'>
      <FaCoins style={{width:"30px", color:"#2C3E50", height:"30px", marginBottom:"10px"}}/>
      <h2>Affordable Fares</h2>
        <p>We believe in providing value for your money. 
        Enjoy competitive pricing without compromising on quality or comfort, 
        ensuring you travel affordably every time.</p>
      </div>
      <div className='card1'>
      <FaCalendar style={{width:"30px", color:"#2C3E50", height:"30px", marginBottom:"10px"}}/>
      <h2>Convenience</h2>
        <p>Plan your trips effortlessly with our user-friendly platform. 
        From seamless booking to hassle-free payment options, 
        we have made your travel experience as smooth as possible.</p>
      </div>
      <div className='card1'>
      <FaShieldAlt style={{width:"30px", color:"#2C3E50", height:"30px", marginBottom:"10px"}}/>
      <h2>Reliability</h2>
        <p>Count on us to get you to your destination safely and on time. 
        Our trusted service and well-maintained transport fleet ensure a dependable journey.</p>
      </div>
      <div className='card1'>
        <FaHeadset style={{width:"30px", color:"#2C3E50", height:"30px", marginBottom:"10px"}}/>
        <h2>24/7 Support</h2>
          <p>Our dedicated support team is available around the clock to assist you. 
          Whether you have questions, need help with bookings, or face any issues, 
          we’re here for you anytime, anywhere.</p>
      </div>
      </div>
      <div>
        <p></p>
      </div>
    </div>
  );
};

export default DesignDisplay;
