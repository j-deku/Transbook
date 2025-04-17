import React, { useState } from 'react';
import './BookSort.css'; 
import { FiX } from 'react-icons/fi'; // Close icon
import { BsFillMenuButtonWideFill } from "react-icons/bs"; // Hamburger icon

const BookSort = ({ onSortChange }) => {
  const [sortOption, setSortOption] = useState("");
  const [isToggle, setIsToggle] = useState(false); // Toggle state for mobile filter menu

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  return (
    <div className='book-sort'>
      {/* Dedicated filtering hamburger */}
      <div className='iconHam' onClick={() => setIsToggle(!isToggle)}>
        {isToggle ? <FiX size={28} /> : <BsFillMenuButtonWideFill size={28} />}
        <div className='dot'></div>
      </div>

      {/* Desktop view: regular book-sort display */}
      <div className="desktop-sort">
        <h2>Sort & Filter</h2>
        <div className='sort-options'>
          <span>Sort by:</span>
          <select value={sortOption} onChange={handleSortChange}>
            <option value="">Select</option>
            <option value="earliest">Earliest Departure</option>
            <option value="lowestPrice">Lowest Price</option>
            <option value="closeDeparture">Close to Departure Point</option>
            <option value="closeArrival">Close to Arrival Point</option>
            <option value="shortestRide">Shortest Ride</option>
          </select>
        </div>
        {/* Additional filters (can be expanded as needed) */}
        <form method='post'>
          <hr />
          <div className='pick-up'>
            <h2>Pick Up Time</h2>
            <div>
              <input type='checkbox' id='time1'/><label htmlFor='time1'>5:00 PM - 8:30 PM</label><br/><br/>
              <input type='checkbox' id='time2'/><label htmlFor='time2'>After 18:00</label><br/><br/>
            </div>
            <hr />
          </div>
          <div className='trust'>
            <h2>Trust and Safety</h2>
            <input type='checkbox' id='verified' /><label htmlFor='verified'>Verified Profile</label><br/><br/>
          </div>
          <hr />
          <div>
            <h2>Amenities</h2>
            <input type='checkbox' id='amenity1' /><label htmlFor='amenity1'>Max. 2 in the back</label><br/><br/>
            <input type='checkbox' id='amenity2' /><label htmlFor='amenity2'>Instant Booking</label><br/><br/>
            <input type='checkbox' id='amenity3' /><label htmlFor='amenity3'>Pets allowed</label><br/><br/>
            <input type='checkbox' id='amenity4' /><label htmlFor='amenity4'>Smoking allowed</label><br/><br/>
            <input type='checkbox' id='amenity5' /><label htmlFor='amenity5'>Reclining Seat</label><br/><br/>
            <input type='checkbox' id='amenity6' /><label htmlFor='amenity6'>Power outlets</label><br/><br/>
            <input type='checkbox' id='amenity7' /><label htmlFor='amenity7'>Toilet</label><br/><br/>
            <input type='checkbox' id='amenity8' /><label htmlFor='amenity8'>Air conditioning</label><br/><br/>
            <input type='checkbox' id='amenity9' /><label htmlFor='amenity9'>Television</label><br/><br/>
          </div>
          <br/>
        </form>
      </div>

      {/* Mobile view: Filter menu overlay */}
      <div className={`filter-menu ${isToggle ? 'show' : ''}`}>
        <h2>Sort & Filter</h2>
        <div className='sort-options'>
          <span>Sort by:</span>
          <select value={sortOption} onChange={handleSortChange}>
            <option value="">Select</option>
            <option value="earliest">Earliest Departure</option>
            <option value="lowestPrice">Lowest Price</option>
            <option value="closeDeparture">Close to Departure Point</option>
            <option value="closeArrival">Close to Arrival Point</option>
            <option value="shortestRide">Shortest Ride</option>
          </select>
        </div>
        {/* Additional filters replicated for mobile */}
        <form method='post'>
          <hr />
          <div className='pick-up'>
            <h2>Pick Up Time</h2>
            <div>
              <input type='checkbox' id='time1_mobile'/><label htmlFor='time1_mobile'>5:00 PM - 8:30 PM</label><br/><br/>
              <input type='checkbox' id='time2_mobile'/><label htmlFor='time2_mobile'>After 18:00</label><br/><br/>
            </div>
            <hr />
          </div>
          <div className='trust'>
            <h2>Trust and Safety</h2>
            <input type='checkbox' id='verified_mobile' /><label htmlFor='verified_mobile'>Verified Profile</label><br/><br/>
          </div>
          <hr />
          <div>
            <h2>Amenities</h2>
            <input type='checkbox' id='amenity1_mobile' /><label htmlFor='amenity1_mobile'>Max. 2 in the back</label><br/><br/>
            <input type='checkbox' id='amenity2_mobile' /><label htmlFor='amenity2_mobile'>Instant Booking</label><br/><br/>
            <input type='checkbox' id='amenity3_mobile' /><label htmlFor='amenity3_mobile'>Pets allowed</label><br/><br/>
            <input type='checkbox' id='amenity4_mobile' /><label htmlFor='amenity4_mobile'>Smoking allowed</label><br/><br/>
            <input type='checkbox' id='amenity5_mobile' /><label htmlFor='amenity5_mobile'>Reclining Seat</label><br/><br/>
            <input type='checkbox' id='amenity6_mobile' /><label htmlFor='amenity6_mobile'>Power outlets</label><br/><br/>
            <input type='checkbox' id='amenity7_mobile' /><label htmlFor='amenity7_mobile'>Toilet</label><br/><br/>
            <input type='checkbox' id='amenity8_mobile' /><label htmlFor='amenity8_mobile'>Air conditioning</label><br/><br/>
            <input type='checkbox' id='amenity9_mobile' /><label htmlFor='amenity9_mobile'>Television</label><br/><br/>
          </div>
          <br/>
          <button onClick={()=>setIsToggle(false)} style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: '#0c2e52', color: '#fff', border: 'none' }}>Close</button>
        </form>
      </div>
    </div>
  );
};

export default BookSort;
