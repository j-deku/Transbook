// CreateRide.jsx
import React, { useContext, useState } from "react";
import "./CreateRide.css";
import axios from "axios";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress"; 
import { Button } from "@mui/material";
// MUI spinner :contentReference[oaicite:9]{index=9}
import { StoreContext } from "../../context/StoreContext";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";

const initialState = {
  pickup: "",
  destination: "",
  price: "",
  description: "",
  selectedDate: "",
  selectedTime: "",
  passengers: 1,
  image: null,
  type: "",
};

const CreateRide = () => {
  const { url } = useContext(StoreContext);
  const [data, setData] = useState({ ...initialState });
  const [showModal, setShowModal] = useState(false);
  const [createdRide, setCreatedRide] = useState(null);
  const [loading, setLoading] = useState(false); // loading state :contentReference[oaicite:10]{index=10}


  const handlePlaceChange = (value, field) => {
    setData((prev) => ({ ...prev, [field]: value ? value.label : "" }));
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    setData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const validateForm = () => {
    const {
      pickup,
      destination,
      price,
      description,
      selectedDate,
      selectedTime,
      type,
      image,
    } = data;
    if (
      !pickup ||
      !destination ||
      !price ||
      !description ||
      !selectedDate ||
      !selectedTime ||
      !type ||
      !image
    ) {
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
    setLoading(true); 

    try {
      const token = localStorage.getItem("token");
      const resp = await axios.post(`${url}/api/driver/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (resp.data.success) {
        // Instead of a toast, show the modal
        setCreatedRide(resp.data.ride);
        setShowModal(true);
      } else {
        toast.error(resp.data.message);
      }
    } catch (err) {
      toast.error("Failed to add ride");
      console.error(err);
    }finally {
      setLoading(false);                // hide spinner in all cases :contentReference[oaicite:12]{index=12}
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setCreatedRide(null);
    setData({ ...initialState });
  };

  return (
    <div className="create-ride">
      <h1>Create A Ride</h1>
      <form className="create-ride-form" onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label>Pickup Location</label>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: data.pickup ? { label: data.pickup } : null,
              onChange: (val) => handlePlaceChange(val, "pickup"),
              placeholder: "Enter pickup location",
              required: true,
            }}
          />
        </div>

        <div className="form-group">
          <label>Destination</label>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: data.destination ? { label: data.destination } : null,
              onChange: (val) => handlePlaceChange(val, "destination"),
              placeholder: "Enter destination",
              required: true,
            }}
          />
        </div>

        <div className="form-group-inline">
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={data.price}
              onChange={onChangeHandler}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Passengers</label>
            <input
              type="number"
              name="passengers"
              value={data.passengers}
              onChange={onChangeHandler}
              min="1"
              max="60"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={data.description}
            onChange={onChangeHandler}
            rows="4"
            required
          />
        </div>

        <div className="form-group-inline">
          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={data.type}
              onChange={onChangeHandler}
              required
            >
              <option value="">Select</option>
              <option value="bus">Bus</option>
              <option value="car">Van</option>
              <option value="motorcycle">Motor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="selectedDate"
              value={data.selectedDate}
              onChange={onChangeHandler}
              required
            />
          </div>
        </div>

        <div className="form-group-inline">
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="selectedTime"
              value={data.selectedTime}
              onChange={onChangeHandler}
              required
            />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="file-input"
              onChange={onFileChange}
              required
            />
          </div>
        </div>

         <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? "ADDING..." : "ADD RIDE"}
        </Button>
      </form>

      {/* Success Modal */}
      <Dialog open={showModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Ride Created Successfully ✅</DialogTitle>
        {createdRide && (
          <DialogContent dividers>
            <Box mb={2}>
              <img
                src={createdRide.imageUrl}
                alt="Ride"
                style={{ width: "100%", height:"400px", borderRadius: 8 }}
              />
            </Box>
            <Typography variant="subtitle1">
              <strong>Pickup:</strong> {createdRide.pickup}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Destination:</strong> {createdRide.destination}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Date:</strong>{" "}
              {new Date(createdRide.selectedDate).toLocaleDateString()}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Time:</strong> {createdRide.selectedTime}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Passengers:</strong> {createdRide.passengers}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Type:</strong> {createdRide.type}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Price:</strong> ${createdRide.price.toFixed(2)}
            </Typography>
            <Box mt={2}>
              <Typography variant="body2">
                {createdRide.description}
              </Typography>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateRide;
