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
  top: '25%',
  marginBottom: 50,
  transform: 'translate(-50%, -50%)',
  color:"#ccc",
  width: 400,
  bgcolor: "#3c3b52",
  boxShadow: 24,
  borderRadius: 2,
  p:7,
};

// Utility: strip accents from strings
const removeAccents = (str) =>
  str.normalize('NFD').replace(/[̀-\u036f]/g, '');

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
  const [pickupIndex, setPickupIndex] = useState(-1);
  const [destIndex, setDestIndex] = useState(-1);
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

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
        <form onSubmit={handleSearch} className="search-form">
          {/* Pickup Input */}
          <div className="form-group pickup">
            <label>Pickup <FaLocationArrow /></label><br/>
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
          <div className="exchange-icon" onClick={handleSwap}><FaExchangeAlt style={{marginTop:"30px", marginLeft:"-50px"}}/></div>
          {/* Destination Input */}
          <div className="form-group destination">
            <label>Destination <FaLocationArrow /></label><br/>
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
           <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Select a date"
            className="date-picker-input"
            calendarClassName="custom-calendar"
            dateFormatCalendar="MMMM yyyy"
            todayButton="Today"
            isClearable
            showPopperArrow={false}
            required
            showMonthDropdown
            dropdownMode="select"
            minDate={new Date()}
            maxDate={new Date(new Date().setDate(new Date().getDate() + 7))}
            timeIntervals={30}
            dateFormat="MMMM d, yyyy"
          />
          </div>
          {/* Passengers */}
          <div className="form-group passengers">
            <label>Passengers <FaUser /></label><br/>
            <div className="passenger-input">
              <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))}>-</button>
              <input value={passengers} readOnly />
              <button type="button" onClick={() => setPassengers(p => p + 1)}>+</button>
            </div>
          </div>
          {/* Submit */}
          <button type="submit" className="btn-submit">Search</button>
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
