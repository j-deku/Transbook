import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./RegisForm.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
import { assets } from "../../assets/assets";

const RegisForm = () => {
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  
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
      const response = await axiosInstance.post(`${url}/api/driver/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // No Authorization header needed for registration
        },
      });
      if (response.data.success) {
        localStorage.setItem("driverId", response.data.driverId);
        // Reset form data (optional)
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
        // Redirect to login page
        navigate("/form-submitted");
        toast.success("Registration successful. Please check your email for further instructions.");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if(error.response && error.response.status === 400) {
        toast.warn(error.response.data.message);
      }
      console.error("Error registering driver:", error.response?.data || error.message);
    }
  };

  return (
    <div className='overlay'>
            <div className='logo'>
              <img src={assets.TransLogo} alt='transBook logo'/>
            </div>
      <div className="add-driver">
        <h2>DRIVER REGISTRATION</h2>
        <form onSubmit={handleSubmit} className="driver-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              name="name" 
              id="name"
              value={driverData.name} 
              onChange={handleChange} 
              autoComplete="current-name"
              placeholder="Driver Name" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email (<b> *</b><em>You'll be notified through it </em>)</label>
            <input 
              type="email" 
              name="email" 
              id="email"
              value={driverData.email} 
              onChange={handleChange} 
              autoComplete="current-email"
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
              autoComplete="current-password"
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
              autoComplete="current-text"
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
              autoComplete="current-text"
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
              autoComplete="current-text"
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
              autoComplete="current-text"
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
              autoComplete="current-number"
              placeholder="Capacity" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="avatar">Profile Photo (optional)</label>
            <input 
              type="file" 
              name="avatar" 
              id="avatar"
              accept="image/*" 
              onChange={handleFileChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit" className="submit-btn">Register</button>
        </form>
        <br /><br />
        <p>Already have an account? <a href='/login'>Login here</a></p>
      </div>
    </div>
  );
};

export default RegisForm;
