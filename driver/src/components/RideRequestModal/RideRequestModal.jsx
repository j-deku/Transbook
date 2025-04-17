import React, { useState, useEffect, useContext } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { StoreContext } from "../../context/StoreContext";
import axiosInstance from "../../../axiosInstance";
import { socket } from "../../../provider/DriverSocketProvider";
import { toast } from "react-toastify";

const RideRequestModal = () => {
  const { url } = useContext(StoreContext);
  const [pendingRide, setPendingRide] = useState(null);
  const [loading, setLoading] = useState(false);

  const respondToRide = async (response) => {
    const rideId = pendingRide?._id || pendingRide?.id;
    if (!rideId || !response) {
      toast.error("Missing rideId or response");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        `${url}/api/driver/ride/respond`,
        { rideId, response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setPendingRide(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error responding to ride:", error.response?.data || error.message);
      toast.error("Error responding to ride");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.on("rideRequest", (data) => {
      console.log("Received rideRequest event:", data);
      if (data && data.ride) {
        setPendingRide(data.ride);
      }
    });
    return () => {
      socket.off("rideRequest");
    };
  }, []);

  return (
    <Dialog open={Boolean(pendingRide)} onClose={() => setPendingRide(null)}>
      <DialogTitle>New Ride Request</DialogTitle>
      <DialogContent dividers>
        {pendingRide ? (
          <>
            <Typography variant="body1"><strong>Pickup:</strong> {pendingRide.pickup}</Typography>
            <Typography variant="body1"><strong>Destination:</strong> {pendingRide.destination}</Typography>
            <Typography variant="body1">
              <strong>Fare:</strong> ${pendingRide.price.toFixed(2)}
            </Typography>
            <Typography variant="body1"><strong>Scheduled Time:</strong> {pendingRide.selectedTime}</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Please approve or decline this ride request.
            </Typography>
          </>
        ) : (
          <Typography variant="body1">No ride details available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <LoadingButton variant="contained" color="error" onClick={() => respondToRide("declined")} loading={loading}>
          Decline
        </LoadingButton>
        <LoadingButton variant="contained" color="success" onClick={() => respondToRide("approved")} loading={loading}>
          Approve
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default RideRequestModal;
