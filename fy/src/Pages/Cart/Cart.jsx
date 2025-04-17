import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const Cart = () => {
  const [selectedRides, setSelectedRides] = useState([]);
  const navigate = useNavigate();
  const { setCartItems } = useContext(StoreContext);

  useEffect(() => {
    const rides = JSON.parse(localStorage.getItem("selectedRides")) || [];
    setSelectedRides(rides);
    setCartItems(rides); // Update the global cartItems state
  }, [setCartItems]);

  const handleRemoveRide = (index) => {
    const updatedRides = selectedRides.filter((_, i) => i !== index);
    setSelectedRides(updatedRides);
    localStorage.setItem("selectedRides", JSON.stringify(updatedRides));
    setCartItems(updatedRides); // Update the context when the cart changes
  };

  const getTotalCartAmount = () => {
    return selectedRides.reduce((total, ride) => total + ride.price, 0);
  };

  const printPage = () => {
    window.print();
  };

  return (
    <div className="cart">
      <div className="cart-item">
        <div className="cart-title">
          <p>Route</p>
          <p>Date</p>
          <p>Price</p>
          <p>Remove</p>
          <p>
            <img onClick={printPage} src={assets.Print} alt="print" />
          </p>
        </div>
        <br />
        <hr />
        {selectedRides.length > 0 ? (
          selectedRides.map((ride, index) => (
            <React.Fragment key={index}>
              <div className="cart-title cart-items-item">
                <p>{ride.pickup} → {ride.destination}</p>
                <p>{new Date(ride.selectedDate).toLocaleDateString()}</p>
                <p>${ride.price.toFixed(2)}</p>
                <p>
                  <img
                    onClick={() => handleRemoveRide(index)}
                    className="delete"
                    src={assets.trash_icon}
                    alt="remove"
                  />
                </p>
              </div>
              <hr />
            </React.Fragment>
          ))
        ) : (
          <p>No rides selected.</p>
        )}
      </div>

      <div className="cart-bottom">
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
              <p>${(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2).toFixed(2)}</p>
            </div>
          </div>
          <button onClick={() => navigate("/checkout")} disabled={selectedRides.length === 0}>
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
