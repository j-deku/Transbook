import { useContext, useState, useEffect, useCallback } from 'react';
import './ExploreMenu.css';
import { Box } from '@mui/material';
import { FaCalendar, FaLocationArrow, FaUser, FaExchangeAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ExploreMenu = () => {
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

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchLocationSuggestions = useCallback(async (input, setFunction) => {
    if (!input) {
      setFunction([]);
      return;
    }
    try {
      const response = await axios.get(`${url}/api/placeApi/autoComplete?input=${encodeURIComponent(input)}`);
      if (response.data.status === 'OK') {
        setFunction(response.data.predictions.map(prediction => ({
          id: prediction.place_id,
          description: prediction.description,
        })));
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

  // Function to swap pickup and destination values
  const handleSwap = () => {
    setPickup(destination);
    setDestination(pickup);
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Search For Available Rides</h1>
      <div className="explore-menu-list">
        <Box>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="pickup">
              <label>
                Pickup Location: <FaLocationArrow style={{ marginLeft: 10 }} />
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

            {/* Exchange Arrow between Pickup and Destination */}
            <div className="exchange-container">
              <FaExchangeAlt className="exchange-icon" onClick={handleSwap} />
            </div>

            <div className="destination">
              <label>
                Destination: <FaLocationArrow style={{ marginLeft: 10 }} />
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

            <div className="date">
              <label>
                Preferred Date: <FaCalendar style={{ marginLeft: 10 }} />
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
              />
            </div>

            <div className="passengers">
              <label>
                Number of Passengers: <FaUser style={{ marginLeft: 10 }} />
              </label>
              <br />
              <div className="passenger-input">
                <button
                  type="button"
                  className="adjust-btn"
                  onClick={() => setPassengers(passengers > 1 ? passengers - 1 : 1)}
                >
                  -
                </button>
                <input type="number" value={passengers} readOnly required />
                <button
                  type="button"
                  className="adjust-btn"
                  onClick={() => setPassengers(passengers + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="search-button">
              <br />
              <br />
              <button type="submit">Search</button>
            </div>
          </form>
        </Box>
      </div>
    </div>
  );
};

export default ExploreMenu;
