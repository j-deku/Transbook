import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DriverTracking from "../../components/DriverTracking/DriverTracking";

const TrackRide = () => {
  const { rideId } = useParams();
  const [rideData, setRideData] = useState(null);

  useEffect(() => {
    // Fetch ride data based on rideId if needed.
    // For example, using axios to call your API endpoint.
  }, [rideId]);

  return (
    <div>
      <h1>Tracking Ride {rideId}</h1>
      {/* Render the driver tracking component */}
      <DriverTracking rideId={rideId} rideData={rideData} />
    </div>
  );
};

export default TrackRide;
