// geocodeAddress.js
import axios from "axios";

const geocodeAddress = async (address) => {
  const apiKey = process.env.GOOGLE_MAP_API; // Ensure this is set
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      return { latitude: location.lat, longitude: location.lng };
    } else if (response.data.status === "ZERO_RESULTS") {
      console.warn(`Geocoding returned ZERO_RESULTS for address: "${address}"`);
      return null; // Gracefully return null if no results are found
    } else {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }
  } catch (error) {
    console.error("Error in geocodeAddress:", error);
    throw error;
  }
};

export default geocodeAddress;
