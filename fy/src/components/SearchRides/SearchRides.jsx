import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchRides.css';
import { FaCheck, FaCircle, FaMotorcycle, FaRegCircle, FaStar } from 'react-icons/fa';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import { StoreContext } from '../../context/StoreContext';
import { Box, Skeleton } from '@mui/material';

const SearchRides = ({ sortOption, filterOption }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchData = location.state || JSON.parse(localStorage.getItem('searchData'));

  useEffect(() => {
    if (!searchData) return;

    const fetchRides = async () => {
      setLoading(true);
      setError('');
      try {
        const params = { ...searchData, sort: sortOption, page: currentPage, limit: 10 };
        if (filterOption && filterOption !== "all") {
          params.filter = filterOption;
        }
        const response = await axios.get(`${url}/api/rides/search`, { params });
        if (response.data.rides && response.data.rides.length > 0) {
          setRides(response.data.rides);
          setTotalPages(response.data.totalPages || 1);
        } else {
          setError('No rides available.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching rides');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [url, JSON.stringify(searchData), sortOption, filterOption, currentPage]);

  const handleSelectRide = (ride) => {
    let selectedRides = JSON.parse(localStorage.getItem('selectedRides')) || [];
    selectedRides.push(ride);
    localStorage.setItem('selectedRides', JSON.stringify(selectedRides));
    navigate('/cart');
  };

  const formatDate = (dateString) => {
    const rideDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (rideDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (rideDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return rideDate.toLocaleDateString();
    }
  };

  // Calculate end time given start time ("HH:mm") and duration ("HH:mm")
  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return startTime;
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [durationHours, durationMinutes] = duration.split(':').map(Number);
    let endHours = startHours + durationHours;
    let endMinutes = startMinutes + durationMinutes;
    if (endMinutes >= 60) {
      endHours += Math.floor(endMinutes / 60);
      endMinutes = endMinutes % 60;
    }
    if (endHours >= 24) {
      endHours = endHours % 24;
    }
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  // Format duration in a professional way
  const formatDuration = (duration) => {
    if (!duration) return "Duration N/A";
    const [hoursStr, minutesStr] = duration.split(':');
    const totalMinutes = parseInt(hoursStr, 10) * 60 + parseInt(minutesStr, 10);
    if (totalMinutes < 1440) {
      return `${hoursStr}h ${minutesStr}m`;
    } else {
      const days = Math.floor(totalMinutes / 1440);
      const remainingMinutes = totalMinutes % 1440;
      const remHours = Math.floor(remainingMinutes / 60);
      const remMinutes = remainingMinutes % 60;
      return `${days}d ${remHours}h ${remMinutes}m`;
    }
  };

  // Render Material UI icon based on ride type
  const renderRideTypeIcon = (rideType) => {
    const type = rideType.toLowerCase();
    if (type === 'bus') return <DirectionsBusIcon style={{ color: '#555', fontSize:"40px" }} />;
    if (type === 'motorcycle') return <FaMotorcycle style={{ color: '#555', fontSize:"40px" }} />;
    if (type === 'car') return <AirportShuttleIcon style={{ color: '#555', fontSize:"40px" }} />;
    // Default icon or null if not matched
    return null;
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className='search-rides'>
       {loading ? (
        // Professional Skeleton Loader for Ride Cards
        <Box className="skeleton-container">
          <Skeleton variant="text" width="70%" height={30} />
          <Skeleton variant="rectangular" width="600px" height="250px" sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" width="600px" height="250px" sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="text" width="40%" height={30} />
        </Box>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          {rides.length > 0 && (
            <>
              <h2>{`${formatDate(rides[0].selectedDate)}, ${rides[0].pickup} > ${rides[0].destination}`}</h2>
              {rides.map((ride) => {
                const endTime = ride.duration ? calculateEndTime(ride.selectedTime, ride.duration) : ride.selectedTime;
                return (
                  <div key={ride._id} className='ride-card'>
                    <div className='ride-date'>
                      <p>{formatDate(ride.selectedDate)}</p>
                      <p>$ {ride.price.toFixed(2)}</p>
                    </div>
                    <hr style={{ width: '100%' }} />
                    <div className='ride-info'>
                      <div className='ride-type' style={{ color: "#555", display: 'flex', alignItems: 'center' }}>
                        {renderRideTypeIcon(ride.type)}
                        <span style={{ marginLeft: 5, fontSize:"18px", fontWeight:"bold" }}>{ride.type}</span>
                      </div>
                      <img
                        src={ride.imageUrl}
                        alt='ride'
                        onError={(e) => (e.target.src = '/default-ride.jpeg')}
                        className="ride-image"
                      />
                      {ride.driver && ride.driver.imageUrl && (
                        <div className="driver-info">
                          <img
                            src={ride.driver.imageUrl}
                            alt={ride.driver.name || "Driver"}
                            className="driver-image"
                          />
                          <span className="driver-name">{ride.driver.name}</span>
                        </div>
                      )}
                      <FaCheck />
                      <p>{ride.description} <FaStar style={{fontSize:"20px", marginTop:10, marginBottom:-5}}/> 5.0</p>
                    </div>
                    {/* Professional Timeline Display */}
                    <div className="ride-timeline">
                      <span className="time-label">{ride.selectedTime}</span>
                      <FaCircle className="timeline-icon" />
                      <div className="timeline-bar">
                        <span className="duration-label">{formatDuration(ride.duration)}</span>
                      </div>
                      <FaRegCircle className="timeline-icon" />
                      <span className="time-label">{endTime}</span>
                    </div>
                    <button onClick={() => handleSelectRide(ride)} className="select-button">
                      Select
                    </button>
                  </div>
                );
              })}
              <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
              </div>
            </>
          )}
          {rides.length === 0 && <p>No rides found.</p>}
        </>
      )}
    </div>
  );
};

export default SearchRides;
