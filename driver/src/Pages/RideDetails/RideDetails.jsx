// src/pages/driver/RideDetails.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const RideDetails = () => {
  const { rideId } = useParams();
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${url}/api/driver/rides/${rideId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) setRide(data.ride);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [rideId, url]);

  if (loading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (!ride) return <Typography>No ride found.</Typography>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Ride Details</Typography>
          <Typography><strong>Pickup:</strong> {ride.pickup}</Typography>
          <Typography><strong>Destination:</strong> {ride.destination}</Typography>
          <Typography><strong>Date:</strong> {new Date(ride.selectedDate).toLocaleDateString()}</Typography>
          <Typography><strong>Time:</strong> {ride.selectedTime}</Typography>
          <Typography><strong>Price:</strong> {ride.currency} {ride.price.toFixed(2)}</Typography>
          <Typography><strong>Seats:</strong> {ride.passengers}</Typography>
          <Typography><strong>Type:</strong> {ride.type}</Typography>
          <Typography><strong>Status:</strong> {ride.status}</Typography>
          <Typography><strong>Commission:</strong> { (ride.commissionRate * 100).toFixed(1) }%</Typography>
          <Typography><strong>Fee:</strong> {ride.currency} {ride.commissionAmount.toFixed(2)}</Typography>
          <Typography><strong>Payout:</strong> {ride.currency} {ride.payoutAmount.toFixed(2)}</Typography>
          {ride.imageUrl && <Box component="img" src={ride.imageUrl} width="100%" sx={{ mt: 2, borderRadius: 1 }} />}
        </CardContent>
      </Card>
      <Box textAlign="center">
        <Button variant="contained" onClick={() => navigate(-1)}>Back to My Rides</Button>
      </Box>
    </Box>
  );
};

export default RideDetails;
