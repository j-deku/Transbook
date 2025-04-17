import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./DriverRides.css";
import axiosInstance from "../../../axiosInstance";

const DriverRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const { url } = useContext(StoreContext);

  const fetchRides = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`${url}/api/driver/rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setRides(response.data.rides);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      toast.error("Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  const updateRideStatus = async (rideId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(
        `${url}/api/driver/ride/status`,
        { rideId, status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setRides((prevRides) =>
          prevRides.map((ride) =>
            ride._id === rideId ? { ...ride, status } : ride
          )
        );
        toast.success("Ride status updated successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating ride status:", error);
      toast.error("Failed to update ride status");
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  if (loading) return <p>Loading rides...</p>;

  return (
    <div className="driver-rides">
      <h3>Your Rides</h3>
      {rides.length === 0 ? (
        <p>No rides found.</p>
      ) : (
        <ul>
          {rides.map((ride) => (
            <li key={ride._id}>
              <p>
                {ride.pickup} &gt; {ride.destination}
              </p>
              <p>Status: {ride.status}</p>
              <select
                onChange={(e) => updateRideStatus(ride._id, e.target.value)}
                value={ride.status}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DriverRides;
