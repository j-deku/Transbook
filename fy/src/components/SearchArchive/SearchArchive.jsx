import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchArchive.css";

const SearchArchive = () => {
  const [archives, setArchives] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedArchives = localStorage.getItem("searchArchives");
    if (storedArchives) {
      try {
        setArchives(JSON.parse(storedArchives));
      } catch (error) {
        console.error("Error parsing search archives:", error);
      }
    }
  }, []);

  const handleArchiveClick = (archive) => {
    navigate("/searchRides", { state: archive });
  };

  if (archives.length === 0) {
    return <p className="archive-empty">No previous searches found.</p>;
  }

  return (
    <div className="search-archive">
      <h3>Previous Searches</h3>
      <ul>
        {archives.map((archive, index) => (
          <li key={index} onClick={() => handleArchiveClick(archive)}>
            <span className="search-date">{new Date(archive.selectedDate).toLocaleDateString()}</span>
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
