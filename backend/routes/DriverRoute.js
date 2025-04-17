import express from "express";
import { cancelRide, completeRide, driverRespondToRide, getCurrentRide, getCurrentRides, getDriverEarnings, getDriverEarningsReport, getDriverHistory, getDriverRating, getPendingRideRequests, getPerformanceMetrics, getUpcomingRides, loginDriver, registerDriver, addRide, RidesById, startRide, submitSupportRequest, updateDriverProfile, updateRideFare, updateRideStatusDriver, getDriverRides, forgotPassword, resetPassword } from "../controllers/DriverController.js";
import driverAuth from "../middlewares/driverAuth.js";
import upload from '../config/Multer.js'

const driverRouter = express.Router();

driverRouter.post('/register', upload.single("avatar"), registerDriver);
driverRouter.post('/login', loginDriver);
driverRouter.post("/forgot-password", forgotPassword);
driverRouter.post("/reset-password/:token", resetPassword);


driverRouter.use(driverAuth);  // Apply driverAuth middleware to all routes
driverRouter.post("/add",  upload.single("image"), addRide);
driverRouter.get("/rides", getDriverRides);
driverRouter.get("/rides/:id", RidesById);
driverRouter.post("/ride/status", updateRideStatusDriver);
driverRouter.get("/current-ride", getCurrentRide);
driverRouter.get("/current-rides", getCurrentRides);
driverRouter.get("/upcoming-rides", getUpcomingRides);
driverRouter.post("/ride/start", startRide);
driverRouter.post("/ride/complete", completeRide);
driverRouter.post("/ride/cancel", cancelRide);
driverRouter.put("/profile", upload.single("avatar"), updateDriverProfile);

driverRouter.get("/earnings", getDriverEarnings);
driverRouter.get("/performance-metrics", getPerformanceMetrics);
driverRouter.get("/rating", getDriverRating); // New rating endpoint
// In DriverRoutes.js (after driverAuth middleware is applied)
driverRouter.get("/history", getDriverHistory);
driverRouter.get("/earnings-report", getDriverEarningsReport);
driverRouter.post("/support", submitSupportRequest);

driverRouter.put("/ride/fare", updateRideFare);
driverRouter.get("/pending-ride-requests", getPendingRideRequests);
driverRouter.post("/ride/respond", driverRespondToRide);
 
export default driverRouter;