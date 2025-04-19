import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import RealTimeMap from '../RealTimeMap/RealTimeMap';

const socket = io(import.meta.env.VITE_API_BASE_URL, {
    path: '/socket.io',
    withCredentials: true,          // sends cookies/auth headers :contentReference[oaicite:11]{index=11}
    transports: ['websocket','polling']
  }
);

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
