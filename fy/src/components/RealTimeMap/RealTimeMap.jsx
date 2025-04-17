import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Skeleton } from "@mui/material";
import './RealTimeMap.css'

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: -3.745, // Default center; update based on your data
  lng: -38.523,
};

const RealTimeMap = ({ driverLocation }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDjc8IBGPePer-NcmBOW76A-qqUOj0iXzs",
  });

  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    if (driverLocation) {
      setMapCenter(driverLocation);
    }
  }, [driverLocation]);

  if (!isLoaded) {
    return (
      <div>
      <h1>Loading Map...</h1>
        <Skeleton sx={{ width: 600, height: 50 }} />
        <Skeleton sx={{ width: 750, height: 80 }} />
        <Skeleton sx={{ width: 900, height: 300 }} />
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={12}>
      {driverLocation && <Marker position={driverLocation} />}
    </GoogleMap>
  );
};

export default RealTimeMap;
