import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import "./UpdateRides.css";
import axiosInstance from "../../../axiosInstance";

const UpdateRides = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);

  const [rideData, setRideData] = useState({
    pickup: "",
    destination: "",
    price: "",
    description: "",
    selectedDate: "",
    selectedTime: "",
    passengers: "",
    type: "",
    driver: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current ride details from backend
  const fetchRideDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/api/admin/rides/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.ride) {
        const ride = response.data.ride;
        setRideData({
          pickup: ride.pickup,
          destination: ride.destination,
          price: ride.price,
          description: ride.description,
          // Format date to YYYY-MM-DD (if stored as ISO string)
          selectedDate: ride.selectedDate ? ride.selectedDate.split("T")[0] : "",
          selectedTime: ride.selectedTime,
          passengers: ride.passengers,
          type: ride.type,
          driver: ride.driver ? ride.driver._id : "",
        });
      } else {
        toast.error("Ride not found");
      }
    } catch (error) {
      toast.error("Failed to fetch ride details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRideData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(rideData).forEach((key) => {
      formData.append(key, rideData[key]);
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${url}/api/admin/rides/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/list"); // Redirect to ride list page (or wherever appropriate)
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update ride");
      console.error(error.response?.data || error.message);
    }
  };

  if (loading) return <p>Loading ride details...</p>;

  return (
    <div className="update-ride">
      <h2>Update Ride Details</h2>
      <form onSubmit={handleSubmit} className="update-ride-form">
        <div className="form-group">
          <label>Pickup Location</label>
          <input type="text" name="pickup" value={rideData.pickup} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Destination</label>
          <input type="text" name="destination" value={rideData.destination} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input type="number" name="price" value={rideData.price} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={rideData.description} onChange={handleChange} required></textarea>
        </div>
        <div className="form-group">
          <label>Selected Date</label>
          <input type="date" name="selectedDate" value={rideData.selectedDate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Selected Time</label>
          <input type="time" name="selectedTime" value={rideData.selectedTime} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Passengers</label>
          <input type="number" name="passengers" value={rideData.passengers} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Ride Type</label>
          <input type="text" name="type" value={rideData.type} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Upload New Image (optional)</label>
          <input type="file" name="image" onChange={handleFileChange} accept="image/*" />
        </div>
        <button type="submit">Update Ride</button>
      </form>
    </div>
  );
};

export default UpdateRides;
