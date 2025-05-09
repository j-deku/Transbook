import { useState } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  FaCalendar,
  FaLocationArrow,
  FaUser,
  FaExchangeAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { DesktopDatePicker, MobileDatePicker } from "@mui/x-date-pickers";
import "./SearchAvailable.css";

const formModalStyle = {
  position: "absolute",
  top: "8%",
  left: "50%",
  transform: "translateX(-50%)",
  bgcolor: "#3c3b52",
  boxShadow: 24,
  justifyContent: "space-evenly",
  borderRadius: "25px 25px 0px 0px",
  p: 4,
  width: "100%",
  maxWidth: "500px",
};

const mapModalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100vh",
  bgcolor: "#000",
  p: 0,
  m: 0,
};

const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const libraries = ["places"];

export default function SearchAvailable() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [pickAuto, setPickAuto] = useState(null);
  const [destAuto, setDestAuto] = useState(null);

  // Form Modal
  // Modal visibility
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  // Fields
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [passengers, setPassengers] = useState(1);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [mapField, setMapField] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 3.8480, lng: 11.5021 });
  const [mapPosition, setMapPosition] = useState(null);

  // Loading states
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const handleOpen = () => {
    if (!pickupCoords && navigator.geolocation) {
      setFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: coords.latitude, lng: coords.longitude };
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK" && results.length) {
              const human = results.find((r) => !r.types.includes("plus_code")) || results[0];
              setPickup(human.formatted_address);
              setPickupCoords(latlng);
            }
            setFetchingLocation(false);
            setOpen(true);
          });
        },
        () => {
          setFetchingLocation(false);
          setOpen(true);
        }
      );
    } else {
      setOpen(true);
    }
  };  
  const handleClose = () => setOpen(false);

  const handleMapOpen = (field) => {
    setMapField(field);
    const coords = field === "pickup" ? pickupCoords : destCoords;
    if (coords) {
      setMapCenter(coords);
      setMapPosition(coords);
    }
    setMapOpen(true);
  };
  const handleMapClose = () => setMapOpen(false);

  const handleMapClick = (e) => {
    const latlng = e.latLng.toJSON();
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addressObj = results.find(r => !r.types.includes("plus_code")) || results[0];
        if (mapField === "pickup") {
          setPickup(addressObj.formatted_address);
          setPickupCoords(latlng);
        } else {
          setDestination(addressObj.formatted_address);
          setDestCoords(latlng);
        }
        setMapPosition(latlng);
      }
    });
  };

  const updateCoords = (place, setter) => {
    if (!place) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: place }, (results, status) => {
      if (status === "OK" && results[0]) {
        setter(results[0].geometry.location.toJSON());
      }
    });
  };

  const handleSwap = () => {
    setPickup(destination);
    setDestination(pickup);
    setPickupCoords(destCoords);
    setDestCoords(pickupCoords);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const options = { fields: ["formatted_address", "geometry"], strictBounds: false };

  const onPickLoad = (auto) => setPickAuto(auto);
  const onPickPlaceChanged = () => {
    const place = pickAuto?.getPlace();
    if (place?.formatted_address) {
      setPickup(place.formatted_address);
      setPickupCoords(place.geometry.location.toJSON());
    }
  };
  const onDestLoad = (auto) => setDestAuto(auto);
  const onDestPlaceChanged = () => {
    const place = destAuto?.getPlace();
    if (place?.formatted_address) setDestination(place.formatted_address);
    updateCoords(place.formatted_address, setDestCoords);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (loadingSearch) return;
    setLoadingSearch(true);
    const rawPick = pickup.split(",")[0].trim();
    const rawDest = destination.split(",")[0].trim();
    const payload = {
      pickup: removeAccents(rawPick),
      destination: removeAccents(rawDest),
      selectedDate: selectedDate?.toISOString().split("T")[0] || "",
      passengers,
    };
    const archives = JSON.parse(localStorage.getItem("searchArchives") || "[]");
    archives.unshift(payload);
    localStorage.setItem("searchArchives", JSON.stringify(archives));
    setOpen(false);
    navigate("/searchRides", { state: payload });
  };

  if (loadError) return <div>Error loading Maps API</div>;
  if (!isLoaded)
    return (
      <>
        <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
        <Skeleton variant="text" width="80%" height={40} sx={{ mt: 2 }} />
        <Skeleton variant="rectangle" width="80%" height={50} sx={{ m: 2, borderRadius: 20 }} />
      </>
    );

  const SearchForm = (
    <form onSubmit={handleSearch} className={`search-form ${isMobile ? "" : "desktop-form"}`}>
      {/* Pickup */}
      <div className="form-group" style={{ position: "relative" }}>
        <label>
          <FaLocationArrow className="icon" /> Pickup
        </label>
        <Autocomplete onLoad={onPickLoad} onPlaceChanged={onPickPlaceChanged} options={options}>
          <input
            type="text"
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value);
              updateCoords(e.target.value, setPickupCoords);
            }}
            className="input"
            placeholder="Enter pickup location"
            required
          />
        </Autocomplete>
        <Button
          size="small"
          variant="text"
          sx={{ position: "absolute", right: -12, top: 25, bottom: 0, color: "#2cf" }}
          onClick={() => handleMapOpen("pickup")}
        >
          Map
        </Button>
      </div>

      {/* Swap */}
      <div className="form-group swap-icon" onClick={handleSwap}>
        <FaExchangeAlt className="icon" size={20} style={{ margin: 0, marginTop: "max(-30px, -50px)" }} />
      </div>

      {/* Destination */}
      <div className="form-group" style={{ position: "relative" }}>
        <label>
          <FaLocationArrow className="icon" /> Destination
        </label>
        <Autocomplete onLoad={onDestLoad} onPlaceChanged={onDestPlaceChanged} options={options}>
          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              updateCoords(e.target.value, setDestCoords);
            }}
            className="input"
            placeholder="Enter destination"
            required
          />
        </Autocomplete>
        <Button
          size="small"
          variant="text"
          sx={{ position: "absolute", right: -12, color: "#2cf", top: 25, bottom: 0, }}
          onClick={() => handleMapOpen("destination")}
        >
          Map
        </Button>
      </div>

      {/* Date */}
      <div className="form-group" style={{ marginLeft: "10px" }}>
        <label>
          <FaCalendar className="icon" /> Preferred Date
        </label>
        {isMobile ? (
          <MobileDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 7 * 86400000)}
            slotProps={{
              textField: {
                InputProps: {
                  sx: {
                    height: "max(35px, 50px)",
                    outline: "1px solid gray",
                    border: "none",
                    color: "#fff",
                    borderRadius: "5px",
                    "& svg": { color: "#007bff", fontSize: "2rem" },
                    "&:hover": { outline: "1px solid darkgray" },
                  },
                },
                required: true,
              },
            }}
          />
        ) : (
          <DesktopDatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            maxDate={new Date(Date.now() + 7 * 86400000)}
            slotProps={{
              textField: {
                InputProps: {
                  sx: {
                    height: "35px",
                    outline: "1px solid gray",
                    border: "none",
                    color: "#fff",
                    borderRadius: "5px",
                    "& svg": { color: "#007bff", fontSize: "2rem" },
                    "&:hover": { outline: "1px solid darkgray" },
                  },
                },
                required: true,
              },
            }}
          />
        )}
      </div>

      {/* Passengers */}
      <div className="form-group">
        <label>
          <FaUser className="icon" /> Passengers
        </label>
        <div className="passenger-control">
          <button
            type="button"
            disabled={passengers <= 1}
            className="passenger-button"
            onClick={() => setPassengers((p) => Math.max(1, p - 1))}
          >
            -
          </button>
          <input value={passengers} readOnly />
          <button
            type="button"
            className="passenger-button"
            disabled={passengers >= 50}
            onClick={() => setPassengers((p) => p + 1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Search Button for All Views */}
      <Button
        type="submit"
        variant="contained"
        fullWidth={isMobile}
        sx={{ mt: 2 }}
        disabled={loadingSearch}
      >
        {loadingSearch ? <CircularProgress size={20} color="inherit" /> : "Search"}
      </Button>
    </form>
  );

  return (
    <div className="available-search">
      {isMobile ? (
        <>
          <h1>Elevate Your Travel in Cameroon</h1>
          <p>Experience a premium travel experience across Cameroon’s cities and scenic landscapes.</p>
          <div className="searchRide-button">
            <Button
              variant="contained"
              onClick={handleOpen}
              disabled={fetchingLocation}
              sx={{
                width: "100%",
                bgcolor: "rgb(21, 57, 112)",
                borderRadius: "30px",
                placeSelf: "center",
                height: "50px",
                fontSize: "1.2rem",
              }}
            >
              {fetchingLocation ? <CircularProgress size={24} color="inherit" /> : "Search Ride"}
            </Button>
          </div>
          <Modal open={open} onClose={handleClose}>
            <Box sx={formModalStyle}>
              <hr style={{ width: "40%", placeSelf:"center", border: "1px solid #2cf", marginTop:"-20px", marginBottom: "30px" }} />
              <Typography variant="h6" sx={{ color: "#2cf", fontWeight: "600", mb: 2, fontSize: "25px", textAlign: "center" }}>
                Search Available Rides
              </Typography>
              {SearchForm}
              <Button fullWidth sx={{ mt: 2 }} variant="outlined" onClick={handleClose}>
                Close
              </Button>
            </Box>
          </Modal>
        </>
      ) : (
        SearchForm
      )}

      {/* Map Modal */}
      <Modal open={mapOpen} onClose={handleMapClose}>
        <Box sx={mapModalStyle}>
          <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
            <IconButton onClick={handleMapClose} sx={{ color: "#ccc", backgroundColor: "rgba(0,0,0,0.5)", position:"relative", bottom:0, borderRadius: "50%" }}>
              <FaArrowLeft size={24} />
            </IconButton>
          </Box>

          {isLoaded && !loadError ? (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={14}
              onClick={handleMapClick}
            >
              {mapPosition && <Marker position={mapPosition} />}
            </GoogleMap>
          ) : (
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress color="inherit" />
            </Box>
          )}

          <Box sx={{ position: "absolute", bottom: 0, width: "100%", bgcolor: "rgba(0,0,0,0.6)", p: 2 }}>
            <Typography sx={{ color: "#fff", mb: 1 }}>
              {mapField === "pickup" ? pickup : destination}
            </Typography>
            <Button variant="contained" fullWidth onClick={handleMapClose}>
              Done
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
