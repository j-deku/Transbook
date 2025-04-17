import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/add" className="sidebar-option" title="Add Item">
          <img src={assets.upload} alt="Add item" />
          <p>Add Ride</p>
        </NavLink>
        <NavLink to="/list" className="sidebar-option" title="List Item">
          <img src={assets.list_Icon} alt="List Items" />
          <p>List Rides</p>
        </NavLink>
        <NavLink to="/book" className="sidebar-option" title="Order item">
          <img src={assets.booking_icon} alt="Orders" />
          <p>Booked Rides</p>
        </NavLink>
        <NavLink to="/add-driver" className="sidebar-option" title="Order item">
          <img src={assets.driver2} alt="Orders" />
          <p>Add Drivers</p>
        </NavLink>
        <NavLink to="/list-drivers" className="sidebar-option" title="Order item">
          <img src={assets.list_Icon} alt="Orders" />
          <p>List Drivers</p>
        </NavLink>
        <NavLink to="/assign-rides" className="sidebar-option" title="Order item">
          <img src={assets.assign_ride3} alt="Orders" />
          <p>Assign Rides</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
