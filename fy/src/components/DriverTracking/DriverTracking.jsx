import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import RealTimeMap from '../RealTimeMap/RealTimeMap';

const socket = io('https://transbook-backend.onrender.com');

const DriverTracking = () => {
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    // Listen for driver location updates
    socket.on('updateDriverLocation', (data) => {
      // You might want to filter by driverId if multiple drivers are connected
      setDriverLocation(data.location);
    });

    return () => socket.off('updateDriverLocation');
  }, []);

  return (
    <div>
      <h2>Driver Tracking</h2>
      <RealTimeMap driverLocation={driverLocation} />
    </div>
  );
};

export default DriverTracking;
