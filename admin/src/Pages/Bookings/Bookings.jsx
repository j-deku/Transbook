import { useState, useEffect, useContext } from 'react';
import './Bookings.css';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import axiosInstance from '../../../axiosInstance';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false); // Loading state for status update
  const { url } = useContext(StoreContext);

  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/api/booking/list`, { headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  const statusHandler = async (event, bookingId) => {
    const newStatus = event.target.value;
    setLoadingStatus(true); // Show loading spinner during status update
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(`/api/booking/status`, {
        bookingId,
        status: newStatus,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId ? { ...booking, status: newStatus } : booking
          )
        );
        toast.success("Status updated successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoadingStatus(false); // Hide loading spinner
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "partially approved":
        return "status-partially";
      case "completed":
        return "status-completed";
      case "pending approval":
        return "status-pending";
      case "declined":
        return "status-cancelled";
      case "refunds":
        return "status-refunds";
      case "re-schedule":
        return "status-reschedule";
      default:
        return "";
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  return (
    <div className="order add">
      <h3>Booking Page</h3>
      <div className="order-list">
        {bookings.map((booking, index) => (
          <div key={index} className="order-item">
            <img src={assets.Parcel2} alt="Order Icon" />
            <div>
              <p className="order-item-design">
                {booking.rides.map((ride, index) => {
                  if (index === booking.rides.length - 1) {
                    return ride.pickup + " > " + ride.destination;
                  } else {
                    return ride.pickup + " > " + ride.destination + ", ";
                  }
                })}
              </p>
              <p className="order-item-name">
                {booking.address.firstName + " " + booking.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{booking.address.street + ","}</p>
                <p>
                  {booking.address.city + ", " + booking.address.state + ", " +
                    booking.address.country + ", " + booking.address.zipCode}
                </p>
              </div>
              <p className="order-item-phone">{booking.address.phone}</p>
            </div>
            <p>Rides: {booking.rides.length}</p>
            <p>{booking.currency} {booking.amount}.00</p>
            <div>
              <p className={`status-badge ${getStatusClass(booking.status)}`}>
                {booking.status}
              </p>
              <select
                onChange={(event) => statusHandler(event, booking._id)}
                value={booking.status}
                disabled={loadingStatus} // Disable dropdown during status update
              >
                <option value="approved">Approved</option>
                <option value="pending approval">pending approval</option>
                <option value="partially approved">partially approved</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
                <option value="refunds">Refunds</option>
                <option value="re-schedule">Re-schedule</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookings;
