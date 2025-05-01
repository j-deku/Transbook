import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchArchive.css";

const SearchArchive = () => {
  const [archives, setArchives] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("searchArchives");
    if (stored) {
      try {
        const allArchives = JSON.parse(stored);
        // Only include searches with selectedDate today or in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = allArchives.filter((archive) => {
          const date = new Date(archive.selectedDate);
          date.setHours(0, 0, 0, 0);
          return date >= today;
        });
        setArchives(upcoming);
      } catch (error) {
        console.error("Error parsing search archives:", error);
      }
    }
  }, []);

  const handleArchiveClick = (archive) => {
    navigate("/searchRides", { state: archive });
  };

  if (archives.length === 0) {
    return <p className="archive-empty">No upcoming searches found.</p>;
  }

  return (
    <div className="search-archive">
      <h3>Upcoming Searches</h3>
      <ul>
        {archives.map((archive, index) => (
          <li key={index} onClick={() => handleArchiveClick(archive)}>
            <span className="search-date">
              {new Date(archive.selectedDate).toLocaleDateString()}
            </span>
            <span className="search-info">
              {archive.pickup} &rarr; {archive.destination} ({archive.passengers} Passenger{archive.passengers > 1 ? "s" : ""})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchArchive;
