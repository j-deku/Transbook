import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import InteractiveMap from "../../components/InteractiveMap/InteractiveMap";
import axiosInstance from "../../../axiosInstance";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import "./CurrentRideOverview.css";

const CurrentRideOverview = () => {
  const { url } = useContext(StoreContext);
  const [currentRide, setCurrentRide] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for editing fare
  const [openEditFare, setOpenEditFare] = useState(false);
  const [newFare, setNewFare] = useState("");
  const [baseFare, setBaseFare] = useState("");
  const [ratePerMile, setRatePerMile] = useState("");
  const [ratePerMinute, setRatePerMinute] = useState("");
  const [surgeMultiplier, setSurgeMultiplier] = useState(1);

  // Fetch the driver's current active ride
  const fetchCurrentRide = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`${url}/api/driver/upcoming-rides`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success && Array.isArray(response.data.rides) && response.data.rides.length > 0) {
        setCurrentRide(response.data.rides[0]);
      } else {
        setCurrentRide(null);
        toast.info(response.data.message || "No active ride found");
      }
    } catch (error) {
      console.error("Error fetching current ride:", error.response?.data || error.message);
      toast.error("Failed to fetch current ride");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentRide();
  }, []);

  // Handler for ride actions (start, complete, cancel)
  const handleRideAction = async (action) => {
    if (!currentRide?._id) return;
    const token = localStorage.getItem("token");
    const endpoints = {
      start: `${url}/api/driver/ride/start`,
      complete: `${url}/api/driver/ride/complete`,
      cancel: `${url}/api/driver/ride/cancel`,
    };

    // Ensure ride is in progress when completing
    if (action === "complete" && currentRide.status.toLowerCase() !== "in progress") {
      toast.warn("Ride must be in progress to complete");
      return;
    }

    try {
      const res = await axiosInstance.post(
        endpoints[action],
        { rideId: currentRide._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Ride ${action}ed successfully`);
        if (action === "start") {
          setCurrentRide({ ...currentRide, status: "in progress" });
        } else {
          setCurrentRide(null);
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(`${action} ride error:`, error.response?.data || error.message);
      toast.error(`Failed to ${action} ride`);
    }
  };

  // Handlers for opening and closing the fare edit modal
  const openEditFareModal = () => {
    setNewFare(currentRide.price);
    // Pre-fill the pricing parameters if needed; adjust these defaults as appropriate
    setBaseFare(50);       // Example: ₦50 as base fare
    setRatePerMile(10);    // Example: ₦10 per distance unit
    setRatePerMinute(0.5); // Example: ₦0.5 per minute
    setSurgeMultiplier(1);
    setOpenEditFare(true);
  };

  const closeEditFareModal = () => {
    setOpenEditFare(false);
  };

  // Handler to update the fare using the backend endpoint
  const handleUpdateFare = async () => {
    if (!newFare || newFare <= 0) {
      toast.error("Please enter a valid fare.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.post(
        `${url}/api/fare/update`,
        {
          rideId: currentRide._id,
          newFare: parseFloat(newFare),
          baseFare: parseFloat(baseFare),
          ratePerMile: parseFloat(ratePerMile),
          ratePerMinute: parseFloat(ratePerMinute),
          surgeMultiplier: parseFloat(surgeMultiplier) || 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Fare updated successfully");
        // Update the ride price in local state
        setCurrentRide({ ...currentRide, price: newFare });
        // Close the modal automatically
        closeEditFareModal();
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      console.error("Error updating fare:", error.response?.data || error.message);
      toast.error("Failed to update fare");
    }
  };

  // For map display: validate coordinates
  const hasValidCoordinates =
    currentRide?.pickupLocation?.coordinates &&
    currentRide.pickupLocation.coordinates.length >= 2 &&
    !isNaN(Number(currentRide.pickupLocation.coordinates[0])) &&
    !isNaN(Number(currentRide.pickupLocation.coordinates[1]));

  const mapUrlFallback = currentRide?.pickup
    ? `https://maps.google.com/maps?q=${encodeURIComponent(currentRide.pickup)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : null;

  if (loading) {
    return (
      <div className="current-ride-overview">
        <p>Loading current ride...</p>
      </div>
    );
  }

  if (!currentRide) {
    return (
      <div className="current-ride-overview">
        <p>No active ride at the moment.</p>
      </div>
    );
  }

  return (
    <div className="current-ride-overview">
      <h2>Current Ride</h2>
      <div className="ride-details">
        <p><strong>Pickup:</strong> {currentRide.pickup}</p>
        <p><strong>Destination:</strong> {currentRide.destination}</p>
        <p>
          <strong>Fare:</strong> ${currentRide.price}{" "}
          <Button onClick={openEditFareModal} variant="outlined" size="small">
            Edit Fare
          </Button>
        </p>
        <p><strong>Status:</strong> {currentRide.status}</p>
      </div>

      <div className="map-wrapper">
        {hasValidCoordinates ? (
          <InteractiveMap
            latitude={Number(currentRide.pickupLocation.coordinates[1])}
            longitude={Number(currentRide.pickupLocation.coordinates[0])}
          />
        ) : mapUrlFallback ? (
          <iframe
            title="Ride Map"
            src={mapUrlFallback}
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        ) : (
          <p>Map not available.</p>
        )}
      </div>

      <div className="ride-actions">
        {["assigned", "scheduled"].includes(currentRide.status.toLowerCase()) && (
          <Button
            onClick={() => handleRideAction("start")}
            variant="contained"
            color="primary"
          >
            Start Ride
          </Button>
        )}
        {currentRide.status.toLowerCase() === "in progress" && (
          <Button
            onClick={() => handleRideAction("complete")}
            variant="contained"
            color="success"
          >
            Complete Ride
          </Button>
        )}
        {currentRide.status.toLowerCase() !== "completed" && (
          <Button
            onClick={() => handleRideAction("cancel")}
            variant="contained"
            color="error"
          >
            Cancel Ride
          </Button>
        )}
      </div>

      {/* Fare Update Modal */}
      <Dialog open={openEditFare} onClose={closeEditFareModal}>
        <DialogTitle>Edit Fare</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Fare"
            type="number"
            fullWidth
            variant="outlined"
            value={newFare}
            onChange={(e) => setNewFare(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Base Fare"
            type="number"
            fullWidth
            variant="outlined"
            value={baseFare}
            onChange={(e) => setBaseFare(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Rate per Mile"
            type="number"
            fullWidth
            variant="outlined"
            value={ratePerMile}
            onChange={(e) => setRatePerMile(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Rate per Minute"
            type="number"
            fullWidth
            variant="outlined"
            value={ratePerMinute}
            onChange={(e) => setRatePerMinute(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Surge Multiplier"
            type="number"
            fullWidth
            variant="outlined"
            value={surgeMultiplier}
            onChange={(e) => setSurgeMultiplier(e.target.value)}
            helperText="Default is 1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditFareModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateFare} color="primary">
            Update Fare
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CurrentRideOverview;
