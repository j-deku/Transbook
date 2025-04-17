import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./AddDriver.css";
import axiosInstance from "../../../axiosInstance";

const AddDriver = () => {
  const { url } = useContext(StoreContext);
  
  // Initial state for driver data including driver-specific fields
  const [driverData, setDriverData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    avatar: null,
    licenseNumber: "",
    vehicleType: "",
    model: "",
    registrationNumber: "",
    capacity: "",
  });

  // Handle input changes for text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriverData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input (avatar)
  const handleFileChange = (e) => {
    setDriverData((prev) => ({ ...prev, avatar: e.target.files[0] }));
  };

  // Basic form validation
  const validateForm = () => {
    const {
      name,
      email,
      password,
      phone,
      licenseNumber,
      vehicleType,
      model,
      registrationNumber,
      capacity,
    } = driverData;
    
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !licenseNumber ||
      !vehicleType ||
      !model ||
      !registrationNumber ||
      !capacity
    ) {
      toast.error("All fields are required");
      return false;
    }
    // Optionally, add more validations (e.g., email format, password strength)
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Use FormData to support file upload
    const formData = new FormData();
    Object.keys(driverData).forEach((key) => {
      formData.append(key, driverData[key]);
    });
    
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(`/api/admin/add-driver`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        toast.success("Driver added successfully");
        // Reset form data
        setDriverData({
          name: "",
          email: "",
          password: "",
          phone: "",
          avatar: null,
          licenseNumber: "",
          vehicleType: "",
          model: "",
          registrationNumber: "",
          capacity: "",
        });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to add driver");
      console.error("Error adding driver:", error.response?.data || error.message);
    }
  };

  return (
    <div className="add-driver">
      <h2>Add New Driver</h2>
      <form onSubmit={handleSubmit} className="driver-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            name="name" 
            id="name"
            value={driverData.name} 
            onChange={handleChange} 
            placeholder="Driver Name" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            name="email" 
            id="email"
            value={driverData.email} 
            onChange={handleChange} 
            placeholder="driver@example.com" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            name="password" 
            id="password"
            value={driverData.password} 
            onChange={handleChange} 
            placeholder="Enter a secure password" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input 
            type="text" 
            name="phone" 
            id="phone"
            value={driverData.phone} 
            onChange={handleChange} 
            placeholder="+1 234 567 8900" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="licenseNumber">License Number</label>
          <input 
            type="text" 
            name="licenseNumber" 
            id="licenseNumber"
            value={driverData.licenseNumber} 
            onChange={handleChange} 
            placeholder="Driver License Number" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="vehicleType">Vehicle Type</label>
          <select 
            name="vehicleType" 
            id="vehicleType"
            value={driverData.vehicleType} 
            onChange={handleChange} 
            required
          >
            <option value="">Select Vehicle Type</option>
            <option value="Car">Car</option>
            <option value="Van">Van</option>
            <option value="Bus">Bus</option>
            <option value="Motorbike">Motorbike</option>
            <option value="Truck">Truck</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="model">Vehicle Model</label>
          <input 
            type="text" 
            name="model" 
            id="model"
            value={driverData.model} 
            onChange={handleChange} 
            placeholder="Vehicle Model" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="registrationNumber">Registration Number</label>
          <input 
            type="text" 
            name="registrationNumber" 
            id="registrationNumber"
            value={driverData.registrationNumber} 
            onChange={handleChange} 
            placeholder="Registration Number" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="capacity">Capacity</label>
          <input 
            type="number" 
            name="capacity" 
            id="capacity"
            value={driverData.capacity} 
            onChange={handleChange} 
            placeholder="Capacity" 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="avatar">Avatar (optional)</label>
          <input 
            type="file" 
            name="avatar" 
            id="avatar"
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
        
        <button type="submit" className="submit-btn">Add Driver</button>
      </form>
    </div>
  );
};

export default AddDriver;
