// middlewares/driverAuth.js
import jwt from "jsonwebtoken";
import DriverModel from "../models/DriverModel.js"; // adjust path as necessary

const driverAuth = async (req, res, next) => {
  // Expect the token in the "Authorization" header in the format: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided." });
  }
  
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the JWT secret from your environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the driver by ID from the decoded token payload
    const driver = await DriverModel.findById(decoded.id);
    if (!driver) {
      return res.status(401).json({ success: false, message: "Driver not found." });
    }
    
    // Attach the driver document to the request for use in subsequent handlers
    req.driver = driver;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    console.error("Driver authentication error:", error);
    return res.status(500).json({ success: false, message: "Authentication error." });
  }
};

export default driverAuth;