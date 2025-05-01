// EditRide.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./EditRide.css";
import { StoreContext } from "../../context/StoreContext";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const EditRide = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
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
    status: "",
  });
  const [existingImageUrl, setExistingImageUrl] = useState("");

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await axios.get(`${url}/api/driver/rides/${rideId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (resp.data.success) {
          const { ride } = resp.data;
          setData({
            pickup: ride.pickup,
            destination: ride.destination,
            price: ride.price,
            description: ride.description,
            selectedDate: ride.selectedDate.split('T')[0],
            selectedTime: ride.selectedTime,
            passengers: ride.passengers,
            image: null,
            type: ride.type,
            status: ride.status,
          });
          setExistingImageUrl(ride.imageUrl);
        }
      } catch (err) {
        toast.error("Failed to load ride");
        console.error("Error fetching ride:", err.response?.data || err.message);
      }
    };
    fetchRide();
  }, [rideId, url]);

  const handlePlaceChange = (val, field) => {
    setData(prev => ({ ...prev, [field]: val ? val.label : "" }));
  };
  const onChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };
    const onFileChange = (e) => {
    setData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const validateForm = () => {
    const { pickup, destination, price, description, selectedDate, selectedTime, type, status } = data;
    if (!pickup || !destination || !price || !description || !selectedDate || !selectedTime || !type || !status) {
      toast.error("All fields must be filled");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === "image" && v) formData.append("image", v, v.name);
      else if (k !== "image") formData.append(k, v);
    });
    try {
      const token = localStorage.getItem("token");
      const resp = await axios.put(`${url}/api/driver/rides/${rideId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      if (resp.data.success) {
        toast.success("Ride updated");
        navigate('/dashboard');
      }
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="create-ride">
      <h1>Edit Ride</h1>
      <form onSubmit={onSubmit} className="create-ride-form">
        <div className="form-group">
          <label>Pickup Location</label>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: data.pickup ? { label: data.pickup, value: data.pickup } : null,
              onChange: (val) => handlePlaceChange(val, 'pickup'),
            }}
          />
        </div>
        <div className="form-group">
          <label>Destination</label>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: data.destination ? { label: data.destination, value: data.destination } : null,
              onChange: (val) => handlePlaceChange(val, 'destination'),
            }}
          />
        </div>
        {/* ...other inputs same as CreateRide, including existing image preview and status select... */}
        {existingImageUrl && (
          <div className="form-group">
            <label>Current Image</label>
            <img src={existingImageUrl} alt="ride" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
          </div>
        )}
        <div className="form-group">
          <label>Replace Image (optional)</label>
          <input type="file" name="image" accept="image/*" onChange={onFileChange} />
        </div>
        <button type="submit" className="btn-submit">UPDATE RIDE</button>
      </form>
    </div>
  );
};

export default EditRide;
