import React, { useContext, useState } from "react";
import "./CreateRide.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";

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

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onFileChange = (event) => {
    // Optionally log the file for debugging:
    // console.log("Selected file:", event.target.files[0]);
    setData((prevData) => ({ ...prevData, image: event.target.files[0] }));
  };

  const validateForm = () => {
    if (
      !data.pickup ||
      !data.destination ||
      !data.price ||
      !data.description ||
      !data.selectedDate ||
      !data.selectedTime ||
      !data.type ||
      !data.image
    ) {
      toast.error("All fields are required");
      return false;
    }
    if (data.price <= 0 || data.passengers <= 0) {
      toast.error("Price and passengers must be greater than zero");
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    // Use Object.entries() to append each key-value pair.
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      // For the file input, append with the file name.
      if (key === "image" && value) {
        formData.append(key, value, value.name);
      } else {
        formData.append(key, value);
      }
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${url}/api/driver/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success("Ride added successfully");
        setData({
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
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to add ride");
      console.error("Error adding ride:", error.response?.data || error.message);
    }
  };

  return (
    <div className="create-ride">
      <h1>Create A Ride</h1>
      <form className="create-ride-form" onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label>Pickup Location</label>
          <input
            onChange={onChangeHandler}
            value={data.pickup}
            type="text"
            placeholder="Paris, France"
            name="pickup"
            required
          />
        </div>
        <div className="form-group">
          <label>Destination</label>
          <input
            onChange={onChangeHandler}
            value={data.destination}
            type="text"
            placeholder="Lille, France"
            name="destination"
            required
          />
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label>Price</label>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              placeholder="$23"
              name="price"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Passengers</label>
            <input
              onChange={onChangeHandler}
              value={data.passengers}
              type="number"
              name="passengers"
              min="1"
              max="60"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Ride Description</label>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            placeholder="Driver's description here ..."
            rows="4"
            required
          ></textarea>
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label>Ride Type</label>
            <select
              name="type"
              value={data.type}
              onChange={onChangeHandler}
              required
            >
              <option value="">Select Ride Type</option>
              <option value="bus">Bus</option>
              <option value="car">Van</option>
              <option value="motorcycle">Motor</option>
            </select>
          </div>
          <div className="form-group">
            <label>Selected Date</label>
            <input
              type="date"
              onChange={onChangeHandler}
              value={data.selectedDate}
              name="selectedDate"
              required
            />
          </div>
        </div>
        <div className="form-group-inline">
          <div className="form-group">
            <label>Selected Time</label>
            <input
              type="time"
              onChange={onChangeHandler}
              value={data.selectedTime}
              name="selectedTime"
              required
            />
          </div>
          <div className="form-group">
            <label>Ride Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={onFileChange}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn-submit">
          ADD RIDE
        </button>
      </form>
    </div>
  );
};

export default CreateRide;
