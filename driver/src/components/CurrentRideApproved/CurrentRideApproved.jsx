import React, { useState, useEffect, useContext } from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { StoreContext } from '../../context/StoreContext';
import axiosInstance from '../../../axiosInstance';

const CurrentRideApproved = () => {
  const { url } = useContext(StoreContext);
  const [currentRide, setCurrentRide] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentRide = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`${url}/api/driver/current-ride`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCurrentRide(res.data.ride);
      }
    } catch (error) {
      console.error("Error fetching current ride:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentRide();
  }, []);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </Box>
    );
  }

  if (!currentRide) {
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
        <Typography variant="body1">No current ride available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Current Ride
          </Typography>
          <Typography variant="body1"><strong>Pickup:</strong> {currentRide.pickup}</Typography>
          <Typography variant="body1"><strong>Destination:</strong> {currentRide.destination}</Typography>
          <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
            Status: {currentRide.status.toUpperCase()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CurrentRideApproved;
