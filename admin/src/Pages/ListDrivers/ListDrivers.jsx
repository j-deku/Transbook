import { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import "./ListDrivers.css";
import axiosInstance from "../../../axiosInstance";

const ListDrivers = () => {
  const { url } = useContext(StoreContext);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all drivers from the backend
  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/api/admin/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data.drivers)) {
        setDrivers(response.data.drivers);
      } else {
        setDrivers([]);
        toast.error(response.data.message || "Unexpected response format");
      }
    } catch (error) {
      setDrivers([]);
      toast.error("Failed to fetch drivers");
      console.error("Error fetching drivers:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handler to approve a driver and re-fetch the drivers list afterwards.
  const handleApprove = async (driverId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(
        `/api/admin/drivers/approve/${driverId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "Driver approved successfully");
      // Re-fetch drivers to update the state with latest data.
      fetchDrivers();
    } catch (error) {
      console.error("Error approving driver:", error.response?.data || error.message);
      toast.error("Failed to approve driver");
    }
  };

  return (
    <div className="list-drivers">
      <h2>Drivers List</h2>
      {loading ? (
        <p>Loading drivers...</p>
      ) : drivers.length === 0 ? (
        <p>No drivers found.</p>
      ) : (
        <table className="drivers-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Avatar</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>License</th>
              <th>Vehicle Type</th>
              <th>Model</th>
              <th>Reg. No.</th>
              <th>Capacity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver, index) => (
              <tr key={driver._id || index}>
                <td>{index + 1}</td>
                <td>
                  {driver.imageUrl ? (
                    <img
                      src={driver.imageUrl}
                      alt={`${driver.name}'s Avatar`}
                      className="driver-avatar"
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{driver.name || "N/A"}</td>
                <td>{driver.email || "N/A"}</td>
                <td>{driver.phone || "N/A"}</td>
                <td>{driver.licenseNumber || "N/A"}</td>
                <td>{driver.vehicle?.vehicleType || "N/A"}</td>
                <td>{driver.vehicle?.model || "N/A"}</td>
                <td>{driver.vehicle?.registrationNumber || "N/A"}</td>
                <td>{driver.vehicle?.capacity || "N/A"}</td>
                <td>
                  <Link to={`/update-driver/${driver._id}`} className="edit-btn">
                    Edit
                  </Link>
                  {/* Use a robust check in case approved is stored as a boolean or string */}
                  {(driver.approved === true || driver.approved === "true" || driver.status === "active") ? (
                    <span
                      style={{
                        color: "green",
                        fontWeight: "bold",
                        marginTop: "8px",
                        display: "block",
                      }}
                    >
                      Approved
                    </span>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(driver._id)}
                      style={{ marginTop: "8px" }}
                    >
                      Approve
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListDrivers;
