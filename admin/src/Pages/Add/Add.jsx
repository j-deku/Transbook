import React, { useContext, useState } from "react";
import "./Add.css";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";

const Add = () => {
  const { url } = useContext(StoreContext);
  
  const [data, setData] = useState({
    pickup: "",
    destination: "",
    price: "",
    description: "",
    selectedDate: "",
    selectedTime: "", // Will store the raw 24-hour time (e.g., "14:30")
    passengers: 1,
    image: null,
    type: "", 
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onFileChange = (event) => {
    setData((prevData) => ({ ...prevData, image: event.target.files[0] }));
  };

  const validateForm = () => {
    if (
      !data.pickup ||
      !data.destination ||
      !data.price ||
      !data.description ||
      !data.selectedDate ||
      !data.selectedTime || // Ensure time is provided
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
    
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${url}/api/admin/add`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}`},
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
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-product-name flex-col">
          <p>Pickup Location</p>
          <input
            onChange={onChangeHandler}
            value={data.pickup}
            type="text"
            placeholder="Pickup Location"
            name="pickup"
            required
          />
        </div>

        <div className="add-product-name flex-col">
          <p>Destination</p>
          <input
            onChange={onChangeHandler}
            value={data.destination}
            type="text"
            placeholder="Destination"
            name="destination"
            required
          />
        </div>

        <div className="add-price flex-col">
          <p>Price</p>
          <input
            onChange={onChangeHandler}
            value={data.price}
            type="number"
            placeholder="$23"
            style={{ width: 100 }}
            name="price"
            min="1"
            required
          />
        </div>

        <div className="add-product-descriptions flex-col">
          <p>Ride Description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            placeholder="Driver's description here ..."
            rows="6"
            required
          ></textarea>
        </div>

        <div className="add-category flex-col">
          <p>Ride Type</p>
          <select
            name="type"
            value={data.type}
            onChange={onChangeHandler}
            required
          >
            <option value="all">Select Ride Type</option>
            <option value="bus">Bus</option>
            <option value="car">Van</option>
            <option value="motorcycle">Motor</option>
          </select>
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Selected Date</p>
            <input
              type="date"
              onChange={onChangeHandler}
              value={data.selectedDate}
              name="selectedDate"
              required
            />
          </div>

          <div className="add-category flex-col">
            <p>Selected Time</p>
            <input
              type="time"
              onChange={onChangeHandler}
              value={data.selectedTime}
              name="selectedTime"
              required
            />
          </div>
        </div>

        <div className="add-passenger flex-col">
            <p>Passengers</p>
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

        <div className="add-image-upload">
          <p>Ride Image</p>
          <input
            type="file"
            id="file"
            name="image"
            accept="image/*"
            onChange={onFileChange}
            required
          />
        </div>

        <button type="submit" className="add-btn">
          ADD
        </button>
      </form>
    </div>
  );
};

export default Add;
