import React, { useContext, useEffect, useState } from 'react';
import './MyBookings.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${url}/api/booking/userBookings`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(response.data.data);
    setData(response.data.data);
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  return (
    <div className='my-bookings'>
      <h2>My Bookings</h2>
      <div className="container">
        {data.map((booking, index) => {
          const rides = booking.rides || [];
          // Check if any ride in this booking is "in progress"
          const inProgress = rides.some(ride => ride.status.toLowerCase() === "in progress");
          return (
            <div key={booking._id || index} className="my-bookings-booking">
              <img src={assets.Parcel} alt="" />
              <p>
                {rides.map((ride, index) => (
                  <React.Fragment key={ride._id || index}>
                    {ride.pickup} → {ride.destination}
                    {index < rides.length - 1 ? ", " : ""}
                  </React.Fragment>
                ))}
              </p>
              <p>{booking.currency} {booking.amount}.00</p>
              <p><strong>Rides:</strong> {rides.length}</p>
              <p>
                <span>&#x25cf;</span> <b>{booking.status}</b>
              </p>
              {inProgress ? (
                <button onClick={() => navigate(`/track-ride/${booking._id}`)}>
                  Track Order
                </button>
              ) : (
                <button disabled>Not Available</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;
