import React, { useState, useEffect, useContext } from 'react';
import './BookSidebar.css';
import { FaBus, FaCar, FaMotorcycle } from 'react-icons/fa';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const BookSideBar = ({ onFilterChange }) => {
  const { url } = useContext(StoreContext);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [counts, setCounts] = useState({
    all: 0,
    motorcycle: 0,
    bus: 0,
    car: 0,
  });

  // Function to fetch ride counts from the backend
  const fetchCounts = async () => {
    try {
      // Optionally, you can pass search parameters if needed
      const response = await axios.get(`${url}/api/rides/rideCounts`);
      if (response.data.success) {
        const countsArray = response.data.counts; // Expected format: [{ _id: "motorcycle", count: 15 }, ...]
        // Initialize counts object
        const newCounts = { all: 0, motorcycle: 0, bus: 0, car: 0 };
        countsArray.forEach(item => {
          newCounts.all += item.count;
          const type = item._id.toLowerCase();
          if (type === "motorcycle" || type === "bus" || type === "car") {
            newCounts[type] = item.count;
          }
        });
        setCounts(newCounts);
      }
    } catch (error) {
      console.error("Error fetching ride counts:", error.response?.data || error.message);
      // Optionally set default counts here if the API fails
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [url]);

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <div
          className={`sidebar-option ${selectedFilter === "all" ? "active" : ""}`}
          title="All Rides"
          onClick={() => handleFilterClick("all")}
        >
          <p style={{ paddingTop: 10, paddingRight: 10 }}>
            All <span className="count">({counts.all})</span>
          </p>
        </div>
        <div
          className={`sidebar-option ${selectedFilter === "motorcycle" ? "active" : ""}`}
          title="Motorcycle Rides"
          onClick={() => handleFilterClick("motorcycle")}
        >
          <p>
            <FaMotorcycle style={{ width: "30px", height: "30px", color: "#555" }} />{" "}
            <span className="count">({counts.motorcycle})</span>
          </p>
        </div>
        <div
          className={`sidebar-option ${selectedFilter === "bus" ? "active" : ""}`}
          title="Bus Rides"
          onClick={() => handleFilterClick("bus")}
        >
          <p>
            <FaBus style={{ width: "30px", height: "30px", color: "#555" }} />{" "}
            <span className="count">({counts.bus})</span>
          </p>
        </div>
        <div
          className={`sidebar-option ${selectedFilter === "car" ? "active" : ""}`}
          title="Car Rides"
          onClick={() => handleFilterClick("car")}
        >
          <p>
            <FaCar style={{ width: "30px", height: "30px", color: "#555" }} />{" "}
            <span className="count">({counts.car})</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookSideBar;
