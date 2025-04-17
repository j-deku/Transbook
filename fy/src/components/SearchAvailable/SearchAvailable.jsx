import { useState, useEffect, useContext, useCallback } from 'react';
import { Box, Button, Modal, Typography, useMediaQuery, useTheme} from '@mui/material';
import { FaCalendar, FaLocationArrow, FaUser, FaExchangeAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./SearchAvailable.css";

const modalStyle = {
  position: 'absolute',
  m: 25,
  top: '28%',
  marginBottom: 50,
  transform: 'translate(-50%, -50%)',
  color:"#ccc",
  width: 400,
  bgcolor: "#3c3b52",
  boxShadow: 24,
  borderRadius: 2,
  p:7,
};

const SearchAvailable = () => {
  // Modal open state
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // States for the search form (integrated ExploreMenu logic)
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [pickupSuggestionIndex, setPickupSuggestionIndex] = useState(-1);
  const [destinationSuggestionIndex, setDestinationSuggestionIndex] = useState(-1);

  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  // Debounce function to avoid too many API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch location suggestions from API
  const fetchLocationSuggestions = useCallback(async (input, setFunction) => {
    if (!input) {
      setFunction([]);
      return;
    }
    try {
      const response = await axios.get(`${url}/api/placeApi/autoComplete?input=${encodeURIComponent(input)}`);
      if (response.data.status === 'OK') {
        setFunction(
          response.data.predictions.map(prediction => ({
            id: prediction.place_id,
            description: prediction.description,
          }))
        );
      } else {
        console.error('Error fetching suggestions:', response.data.status);
        setFunction([]);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  }, [url]);

  const debouncedFetchPickup = useCallback(debounce(fetchLocationSuggestions, 500), [fetchLocationSuggestions]);
  const debouncedFetchDestination = useCallback(debounce(fetchLocationSuggestions, 500), [fetchLocationSuggestions]);

  useEffect(() => {
    debouncedFetchPickup(pickup, setSuggestions);
    setPickupSuggestionIndex(-1);
  }, [pickup, debouncedFetchPickup]);

  useEffect(() => {
    debouncedFetchDestination(destination, setDestinationSuggestions);
    setDestinationSuggestionIndex(-1);
  }, [destination, debouncedFetchDestination]);

  const handleSuggestionSelect = (description, setFunction) => {
    setFunction(description);
    setShowPickupSuggestions(false);
    setShowDestinationSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchData = { pickup, destination, selectedDate, passengers };
    localStorage.setItem('searchData', JSON.stringify(searchData));

    let archives = [];
    const storedArchives = localStorage.getItem('searchArchives');
    if (storedArchives) {
      try {
        archives = JSON.parse(storedArchives);
      } catch (err) {
        archives = [];
      }
    }
    archives.unshift(searchData);
    localStorage.setItem('searchArchives', JSON.stringify(archives));

    navigate('/searchRides', { state: searchData });
  };

  const handlePickupKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPickupSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPickupSuggestionIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (pickupSuggestionIndex >= 0 && pickupSuggestionIndex < suggestions.length) {
        handleSuggestionSelect(suggestions[pickupSuggestionIndex].description, setPickup);
        setPickupSuggestionIndex(-1);
      }
    }
  };

  const handleDestinationKeyDown = (e) => {
    if (!destinationSuggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDestinationSuggestionIndex(prev => (prev + 1) % destinationSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDestinationSuggestionIndex(prev => (prev <= 0 ? destinationSuggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (destinationSuggestionIndex >= 0 && destinationSuggestionIndex < destinationSuggestions.length) {
        handleSuggestionSelect(destinationSuggestions[destinationSuggestionIndex].description, setDestination);
        setDestinationSuggestionIndex(-1);
      }
    }
  };

  // Swap pickup and destination values
  const handleSwap = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  return (
    <div className="available-search">
      <h1>Elevate Your Travel in Cameroon</h1>
      <p>
        Experience a premium travel experience across Cameroon’s bustling cities and scenic landscapes.
      </p>
      <Button variant="contained" onClick={handleOpen}>
        Search Ride
      </Button>
      {isMobile && (
        <Modal 
        open={open} 
        onClose={handleClose} 
        aria-labelledby="modal-search-title" 
        aria-describedby="modal-search-description"
        className='modal'
      >
        <Box sx={modalStyle}>
          <Typography id="modal-search-title" variant="h6" component="h2" sx={{ mb: 2, color:"#fff" }}>
            Search Available Rides
          </Typography>
          <form className="search-form" onSubmit={handleSearch}>
            {/* Pickup Field */}
            <div className="pickup">
              <label>
                Pickup Location: <FaLocationArrow style={{ marginLeft: 10, color:"#fff" }} />
              </label>
              <br />
              <input
                type="text"
                placeholder="Enter pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                onFocus={() => setShowPickupSuggestions(true)}
                onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
                onKeyDown={handlePickupKeyDown}
                required
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
              {showPickupSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list" onMouseDown={(e) => e.preventDefault()}>
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleSuggestionSelect(suggestion.description, setPickup)}
                      className={index === pickupSuggestionIndex ? 'active-suggestion' : ''}
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Swap Button */}
            <div className="exchange-container" style={{ textAlign: 'center', margin: '16px 0' }}>
              <FaExchangeAlt className="exchange-icon" onClick={handleSwap} style={{ cursor: 'pointer' }} />
            </div>

            {/* Destination Field */}
            <div className="destination">
              <label>
                Destination: <FaLocationArrow style={{ marginLeft: 10, color:"#fff" }} />
              </label>
              <br />
              <input
                type="text"
                placeholder="Enter your destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setShowDestinationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                onKeyDown={handleDestinationKeyDown}
                required
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
              {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                <ul className="suggestions-list" onMouseDown={(e) => e.preventDefault()}>
                  {destinationSuggestions.map((suggestion, index) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleSuggestionSelect(suggestion.description, setDestination)}
                      className={index === destinationSuggestionIndex ? 'active-suggestion' : ''}
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Date Picker Field */}
            <div className="date" style={{ marginTop: '16px' }}>
              <label>
                Preferred Date: <FaCalendar style={{ marginLeft: 10, color:"#fff" }} />
              </label>
              <br />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholderText="Select a date"
                className="date-picker"
                required
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                minDate={new Date()}
                maxDate={new Date(new Date().setDate(new Date().getDate() + 7))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
                timeInputLabel="Time:"
                style={{ width: '100%' }}
              />
            </div>

            {/* Passengers Field */}
            <div className="passengers" style={{ marginTop: '16px' }}>
              <label>
                Number of Passengers: <FaUser style={{ marginLeft: 10, color:"#fff" }} />
              </label>
              <br />
              <div className="passenger-input" style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  type="button"
                  className="adjust-btn"
                  onClick={() => setPassengers(passengers > 1 ? passengers - 1 : 1)}
                  style={{ padding: '10px 30px' }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={passengers}
                  readOnly
                  required
                  style={{ width: '50px', textAlign: 'center', margin: '0 8px' }}
                />
                <button
                  type="button"
                  className="adjust-btn"
                  onClick={() => setPassengers(passengers + 1)}
                  style={{ padding: '10px 30px' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Search Button */}
            <div className="search-button" style={{ marginTop: '24px', textAlign: 'center' }}>
              <Button type="submit" variant="contained">
                Search
              </Button>
            </div>
          </form>
          
          {/* Close Modal Button */}
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleClose} 
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
      )}
    </div>
  );
};

export default SearchAvailable;
