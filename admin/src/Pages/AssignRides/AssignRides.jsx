import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./AssignRides.css"; // Create or adjust your CSS for a professional look
import axiosInstance from "../../../axiosInstance";

const AssignRides = () => {
  const { url } = useContext(StoreContext);
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  // This state maps each ride's ID to the selected driver ID
  const [selectedDrivers, setSelectedDrivers] = useState({});

  // Fetch rides from admin endpoint
  const fetchRides = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/api/admin/rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.rides) {
        setRides(response.data.rides);
      } else {
        toast.error("Failed to fetch rides.");
      }
    } catch (error) {
      toast.error("Error fetching rides");
      console.error(error);
    }
  };

  // Fetch drivers from admin endpoint
  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/api/admin/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.drivers) {
        setDrivers(response.data.drivers);
      } else {
        toast.error("Failed to fetch drivers.");
      }
    } catch (error) {
      toast.error("Error fetching drivers");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRides();
    fetchDrivers();
  }, []);

  // Handler for when an admin selects a driver from the dropdown for a specific ride
  const handleDriverChange = (rideId, event) => {
    const driverId = event.target.value;
    setSelectedDrivers((prev) => ({ ...prev, [rideId]: driverId }));
  };

  // Function to assign a ride to a driver
  const assignRide = async (rideId) => {
    const driverId = selectedDrivers[rideId];
    if (!driverId) {
      toast.error("Please select a driver for this ride");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(
        `/api/admin/assign-ride`,
        { rideId, driverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Ride assigned successfully");
        // Refresh the rides list so the UI updates with the new assignment
        fetchRides();
      } else {
        toast.error(response.data.message || "Failed to assign ride");
      }
    } catch (error) {
      toast.error("Error assigning ride");
      console.error(error);
    }
  };

  return (
    <div className="assign-ride-container">
      <h2>Assign Rides to Drivers</h2>
      <table className="assign-ride-table">
        <thead>
          <tr>
            <th>Ride ID</th>
            <th>Pickup</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Driver</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rides.map((ride) => (
            <tr key={ride._id}>
              <td>{ride._id}</td>
              <td>{ride.pickup}</td>
              <td>{ride.destination}</td>
              <td>{ride.status}</td>
              <td>
                {ride.driver ? (
                  // If the ride is already assigned, show the driver name (if available)
                  <span>{ride.driver.name || "Assigned"}</span>
                ) : (
                  // Otherwise, provide a dropdown to select a driver
                  <select
                    value={selectedDrivers[ride._id] || ""}
                    onChange={(e) => handleDriverChange(ride._id, e)}
                  >
                    <option value="">Select driver</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} ({driver.email})
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td>
                {!ride.driver && (
                  <button onClick={() => assignRide(ride._id)}>
                    Assign
                  </button>
                )}
                {ride.driver && <span>Assigned</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignRides;
