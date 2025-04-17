import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./UpdateDrivers.css";
import axiosInstance from "../../../axiosInstance";

const UpdateDrivers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  
  const [driverData, setDriverData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    vehicleType: "",
    model: "",
    registrationNumber: "",
    capacity: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch driver details from backend
  const fetchDriverDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      // Assuming an endpoint exists to fetch a single driver details:
      const response = await axiosInstance.get(`/api/admin/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.driver) {
        const driver = response.data.driver;
        setDriverData({
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          licenseNumber: driver.licenseNumber,
          vehicleType: driver.vehicle?.vehicleType || "",
          model: driver.vehicle?.model || "",
          registrationNumber: driver.vehicle?.registrationNumber || "",
          capacity: driver.vehicle?.capacity || "",
        });
      } else {
        toast.error("Driver not found");
      }
    } catch (error) {
      toast.error("Failed to fetch driver details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDriverDetails();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(driverData).forEach((key) => {
      formData.append(key, driverData[key]);
    });
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${url}/api/admin/drivers/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/list-drivers"); // Redirect to driver list page (or wherever appropriate)
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update driver");
      console.error(error.response?.data || error.message);
    }
  };
  
  if (loading) return <p>Loading driver details...</p>;
  
  return (
    <div className="update-driver">
      <h2>Update Driver Details</h2>
      <form onSubmit={handleSubmit} className="update-driver-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={driverData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={driverData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" value={driverData.phone} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>License Number</label>
          <input type="text" name="licenseNumber" value={driverData.licenseNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Vehicle Type</label>
          <select name="vehicleType" value={driverData.vehicleType} onChange={handleChange} required>
            <option value="">Select Vehicle Type</option>
            <option value="Car">Car</option>
            <option value="Van">Van</option>
            <option value="Bus">Bus</option>
            <option value="Motorbike">Motorbike</option>
            <option value="Truck">Truck</option>
          </select>
        </div>
        <div className="form-group">
          <label>Vehicle Model</label>
          <input type="text" name="model" value={driverData.model} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Registration Number</label>
          <input type="text" name="registrationNumber" value={driverData.registrationNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Capacity</label>
          <input type="number" name="capacity" value={driverData.capacity} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Update Avatar (optional)</label>
          <input type="file" name="avatar" onChange={handleFileChange} accept="image/*" />
        </div>
        <button type="submit">Update Driver</button>
      </form>
    </div>
  );
};

export default UpdateDrivers;
