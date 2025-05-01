// CreateRide.jsx
import React, { useContext, useState } from "react";
import "./CreateRide.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const CreateRide = () => {
  const { url } = useContext(StoreContext);
  const [data, setData] = useState({
    pickup: "",
    destination: "",
    price: "",
    description: "",
    selectedDate: "",
    selectedTime: "",
    passengers: 1,
    image: null,
    type: "",
  });

  const handlePlaceChange = (value, field) => {
    setData(prev => ({ ...prev, [field]: value ? value.label : "" }));
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    setData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const validateForm = () => {
    const { pickup, destination, price, description, selectedDate, selectedTime, type, image } = data;
    if (!pickup || !destination || !price || !description || !selectedDate || !selectedTime || !type || !image) {
      toast.error("All fields are required");
      return false;
    }
    if (price <= 0 || data.passengers <= 0) {
      toast.error("Price and passengers must be greater than zero");
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "image" && value) {
        formData.append(key, value, value.name);
      } else {
        formData.append(key, value);
      }
    });

    try {
      const token = localStorage.getItem("token");
      const resp = await axios.post(
        `${url}/api/driver/add`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      if (resp.data.success) {
        toast.success("Ride added successfully");
        setData({ pickup: "", destination: "", price: "", description: "", selectedDate: "", selectedTime: "", passengers: 1, image: null, type: "" });
      } else {
        toast.error(resp.data.message);
      }
    } catch (err) {
      toast.error("Failed to add ride");
      console.error(err);
    }
  };

  return (
    <div className="create-ride">
      <h1>Create A Ride</h1>
      <form className="create-ride-form" onSubmit={onSubmitHandler}>
        {/* Google Autocomplete for Pickup */}
        <div className="form-group">
          <label>Pickup Location</label>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: data.pickup ? { label: data.pickup, value: data.pickup } : null,
              onChange: (val) => handlePlaceChange(val, 'pickup'),
              placeholder: 'Enter pickup location',
              required: true
            }}
          />
        </div>
        {/* Google Autocomplete for Destination */}
        <div className="form-group">
          <label>Destination</label>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: data.destination ? { label: data.destination, value: data.destination } : null,
              onChange: (val) => handlePlaceChange(val, 'destination'),
              placeholder: 'Enter destination',
              required: true
            }}
          />
        </div>
        {/* Rest of form... */}
        <div className="form-group-inline">
          <div className="form-group">
            <label>Price</label>
            <input type="number" name="price" value={data.price} onChange={onChangeHandler} min="1" required />
          </div>
          <div className="form-group">
            <label>Passengers</label>
            <input type="number" name="passengers" value={data.passengers} onChange={onChangeHandler} min="1" max="60" required />
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={data.description} onChange={onChangeHandler} rows="4" required />
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label>Type</label>
            <select name="type" value={data.type} onChange={onChangeHandler} required>
              <option value="">Select</option>
              <option value="bus">Bus</option>
              <option value="car">Van</option>
              <option value="motorcycle">Motor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="selectedDate" value={data.selectedDate} onChange={onChangeHandler} required />
          </div>
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label>Time</label>
            <input type="time" name="selectedTime" value={data.selectedTime} onChange={onChangeHandler} required />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input type="file" name="image" accept="image/*" onChange={onFileChange} required />
          </div>
        </div>
        <button type="submit" className="btn-submit">ADD RIDE</button>
      </form>
    </div>
  );
};
export default CreateRide;
