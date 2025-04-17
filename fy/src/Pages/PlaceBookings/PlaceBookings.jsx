import { useContext, useState, useEffect } from "react";
import "./PlaceBookings.css";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import axiosInstance from "../../../axiosInstance";

const PlaceBookings = () => {
  const { token, url } = useContext(StoreContext);
  const [selectedRides, setSelectedRides] = useState([]);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    // Fetch selected rides from localStorage or context
    const rides = JSON.parse(localStorage.getItem("selectedRides")) || [];
    setSelectedRides(rides);
  }, []);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const getTotalCartAmount = () => {
    return selectedRides.reduce((total, ride) => total + ride.price, 0);
  };

  const placeBook = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("You must be logged in to place your booking");
      return;
    }

    if (selectedRides.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    let orderData = {
      address: data,
      rides: selectedRides,
      amount: getTotalCartAmount() + 2, // Adding service fee
      status: "pending approval",
      email: data.email,
    };

    try {
      const token = localStorage.getItem("token");
      let response = await axiosInstance.post(`${url}/api/booking/place`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },      
      });

      if (response.data.success) {
        const { authorization_url } = response.data;
        if (authorization_url) {
          window.location.replace(authorization_url);
        } else {
          console.error("Invalid authorization URL", response.data);
          toast.error("Error: Invalid authorization URL");
        }
      } else {
        toast.error("Error placing order");
      }
    } catch (error) {
      console.error("Axios error:", error.response?.data || error.message);
      toast.error("An error occurred while placing your order");
    }
  };

  return (
    <form onSubmit={placeBook} className="placeOrder">
      <div className="placeOrder-left">
        <p className="title">Booking Information</p>
        <div className="multi-fields">
          <input
            type="text"
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            placeholder="First Name"
            required
          />
          <input
            type="text"
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            placeholder="Last Name"
            required
          />
        </div>
        <input
          type="email"
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          placeholder="Email Address"
          required
        />
        <input
          type="text"
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          placeholder="Street Name"
          required
        />
        <div className="multi-fields">
          <input
            type="text"
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            placeholder="City Name"
            required
          />
          <input
            type="text"
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            placeholder="State Name"
            required
          />
        </div>
        <div className="multi-fields">
          <input
            type="text"
            name="zipCode"
            onChange={onChangeHandler}
            value={data.zipCode}
            placeholder="Zip Code"
            required
          />
          <input
            type="text"
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            placeholder="Country Name"
            required
          />
        </div>
        <input
          type="tel"
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          placeholder="Phone +2333 ...."
          required
        />
      </div>

      <div className="placeOrder-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>SubTotal</p>
              <p>${getTotalCartAmount().toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Service Fee</p>
              <p>${getTotalCartAmount() === 0 ? "0.00" : "2.00"}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Total</p>
              <p>
                ${(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2).toFixed(2)}
              </p>
            </div>
          </div>
          <button type="submit" disabled={selectedRides.length === 0}>
            PROCEED TO PAYMENT
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceBookings;