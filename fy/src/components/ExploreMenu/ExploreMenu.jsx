import { useContext, useState, useEffect, useCallback } from 'react';
import './ExploreMenu.css';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { FaCalendar, FaLocationArrow, FaUser, FaExchangeAlt } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MobileDatePicker, DesktopDatePicker } from '@mui/x-date-pickers';
// Utility: strip accents from strings
const removeAccents = (str) =>
  str.normalize('NFD').replace(/[̀-\u036f]/g, '');

const ExploreMenu = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [pickupIndex, setPickupIndex] = useState(-1);
  const [destIndex, setDestIndex] = useState(-1);
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  const theme = useTheme();
const isMobileView = useMediaQuery(theme.breakpoints.down('sm'));


  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };
  
  const fetchLocationSuggestions = useCallback(
    async (input, setFn) => {
      if (!input) {
        setFn([]);
        return;
      }
      try {
        const res = await axios.get(
          `${url}/api/placeApi/autoComplete?input=${encodeURIComponent(input)}`
        );
        if (res.data.status === 'OK') {
          setFn(
            res.data.predictions.map((p) => ({ id: p.place_id, desc: p.description }))
          );
        } else {
          setFn([]);
        }
      } catch {
        setFn([]);
      }
    },
    [url]
  );

  const debouncedPickup = useCallback(debounce(fetchLocationSuggestions, 500), [fetchLocationSuggestions]);
  const debouncedDest = useCallback(debounce(fetchLocationSuggestions, 500), [fetchLocationSuggestions]);

  useEffect(() => {
    debouncedPickup(pickup, setSuggestions);
    setPickupIndex(-1);
  }, [pickup, debouncedPickup]);

  useEffect(() => {
    debouncedDest(destination, setDestinationSuggestions);
    setDestIndex(-1);
  }, [destination, debouncedDest]);

  const handleSuggestionSelect = (desc, setter) => {
    setter(desc);
    setShowPickupSuggestions(false);
    setShowDestinationSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Use only the city/first segment before comma
    const rawPickup = pickup.split(',')[0].trim();
    const rawDestination = destination.split(',')[0].trim();
    const searchData = {
      pickup: removeAccents(rawPickup),
      destination: removeAccents(rawDestination),
      selectedDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      passengers,
    };
    // Save to localStorage
    const archives = JSON.parse(localStorage.getItem('searchArchives')) || [];
    archives.unshift(searchData);
    localStorage.setItem('searchArchives', JSON.stringify(archives));
    navigate('/searchRides', { state: searchData });
  };

  const handleKeyDown = (e, list, index, setter, suggestionsList) => {
    if (!suggestionsList.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setter((prev) => (prev + 1) % suggestionsList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setter((prev) => (prev <= 0 ? suggestionsList.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (index >= 0 && index < suggestionsList.length) {
        handleSuggestionSelect(suggestionsList[index].desc, list);
      }
    }
  };

  const handleSwap = () => {
    setPickup(destination);
    setDestination(pickup);
  };

  return (
    <div className="explore-menu">
      <h1>Search For Available Rides</h1>
      <Box>
        <form onSubmit={handleSearch} className="search-form">
          {/* Pickup Input */}
          <div className="form-group pickup">
            <label>Pickup <FaLocationArrow /></label>
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              onFocus={() => setShowPickupSuggestions(true)}
              onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
              onKeyDown={(e) => handleKeyDown(e, null, pickupIndex, setPickupIndex, suggestions)}
              placeholder="Enter pickup location"
              required
            />
            {showPickupSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((s, i) => (
                  <li
                    key={s.id}
                    className={i === pickupIndex ? 'active' : ''}
                    onClick={() => handleSuggestionSelect(s.desc, setPickup)}
                  >
                    {s.desc}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Swap Icon */}
          <div className="exchange-icon" onClick={handleSwap}><FaExchangeAlt style={{marginTop:"20px"}}/></div>
          {/* Destination Input */}
          <div className="form-group destination">
            <label>Destination <FaLocationArrow /></label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setShowDestinationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
              onKeyDown={(e) => handleKeyDown(e, null, destIndex, setDestIndex, destinationSuggestions)}
              placeholder="Enter destination"
              required
            />
            {showDestinationSuggestions && destinationSuggestions.length > 0 && (
              <ul className="suggestions-list">
                {destinationSuggestions.map((s, i) => (
                  <li
                    key={s.id}
                    className={i === destIndex ? 'active' : ''}
                    onClick={() => handleSuggestionSelect(s.desc, setDestination)}
                  >
                    {s.desc}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Date Picker */}

          <div className="form-group date">
          <label>Preferred Date <FaCalendar /></label><br/>
          {isMobileView ? (
            <MobileDatePicker
              label="Select date"
              className='date-picker'
              views={['year', 'month', 'day']}
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              minDate={new Date()}
              maxDate={new Date(new Date().setDate(new Date().getDate() + 7))}
              slotProps={{
                  textField: {
                    InputProps: {
                      sx: {
                        height: '40px',
                        outline: '1px solid gray',
                        border:'none',
                        color: '#fff',
                        borderRadius: '5px',
                        '& svg': { color: '#ccc' },
                        '&:hover': { outline: '1px solid darkgray' },
                      },
                    },
                  },
                }}              
            />
          ) : (
            <DesktopDatePicker
              label="Select date"
              className='date-picker'
              views={['year', 'month', 'day']}
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              minDate={new Date()}
              maxDate={new Date(new Date().setDate(new Date().getDate() + 7))}
              slotProps={{
                  textField: {
                    InputProps: {
                      sx: {
                        height: '35px',
                        outline: '1px solid gray',
                        border:'none',
                        color: '#fff',
                        borderRadius: '5px',
                        '& svg': { color: '#ccc' },
                        '&:hover': { outline: '1px solid darkgray' },
                      },
                    },
                  },
                }}         
                renderDay={(day, selectedDate, isInCurrentMonth, dayComponent) => {
                const isSelected = selectedDate && day.getDate() === selectedDate.getDate() && day.getMonth() === selectedDate.getMonth() && day.getFullYear() === selectedDate.getFullYear();
                return (
                  <div className={`day ${isSelected ? 'selected' : ''}`}>
                    {dayComponent}
                  </div>
                );
              }}     
            />
          )}
        </div>          {/* Passengers */}
          <div className="form-group passengers">
            <label>Passengers <FaUser /></label>
            <div className="passenger-input">
              <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))}>-</button>
              <input value={passengers} readOnly />
              <button type="button" onClick={() => setPassengers(p => p + 1)}>+</button>
            </div>
          </div>
          {/* Submit */}
          <button type="submit" className="btn-submit">Search</button>
        </form>
      </Box>
    </div>
  );
};

export default ExploreMenu;
