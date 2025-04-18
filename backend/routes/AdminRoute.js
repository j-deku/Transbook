import express from "express";
import upload from '../config/Multer.js';
import { 
  AdminLogin, 
  forgotPassword, 
  getBookingStatusDistribution, 
  getDashboardStats, 
  getMonthlyBookings, 
  getMonthlyRevenue, 
  resetPassword,
  getAllRides,
  getRideById,
  assignRideToDriver,
  updateRideStatus,
  getAllDrivers,
  getAllBookings,
  addRide,
  listRide,
  removeRide,
  rideSearch,
  addDriver,
  updateRideDetails, // New endpoint
  updateDriverDetails, // New endpoint
  getDriverById,
  approveDriver,
} from "../controllers/AdminController.js";
import verifyAdmin  from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

// Public endpoints for login and password resets

adminRouter.post("/login", AdminLogin);
adminRouter.post("/forgot-password", forgotPassword);
adminRouter.post("/reset-password/:token", resetPassword);

// Apply verifyAdmin middleware for all endpoints defined below
adminRouter.use(verifyAdmin);
// Protected admin dashboard route
adminRouter.get("/dashboard", (req, res) => {
  res.json({ success: true, message: "Welcome to the admin dashboard!", admin: req.admin });
});

// Protected stats endpoints
adminRouter.get("/stats", getDashboardStats);
adminRouter.get("/monthly-revenue", getMonthlyRevenue);
adminRouter.get("/booking-status", getBookingStatusDistribution);
adminRouter.get("/monthly-bookings", getMonthlyBookings);

// Ride management endpoints
adminRouter.get("/rides", getAllRides);
adminRouter.get("/rides/:id", getRideById);
adminRouter.post("/assign-ride", assignRideToDriver);
adminRouter.put("/rides/:id/status", updateRideStatus);

// New endpoint for updating ride details
adminRouter.put("/rides/:id", upload.single("image"), updateRideDetails);

// Driver and Booking endpoints
adminRouter.get("/drivers", getAllDrivers);
adminRouter.put("/drivers/approve/:driverId", approveDriver);
adminRouter.get("/bookings", getAllBookings);

// Additional ride endpoints
adminRouter.post("/add", upload.single("image"), addRide);
adminRouter.get("/list", listRide);
adminRouter.post("/remove", removeRide);
adminRouter.get("/search", rideSearch);

// New endpoint to add drivers
adminRouter.post("/add-driver", upload.single("avatar"), addDriver);

// New endpoint to update driver details
adminRouter.get("/drivers/:id", getDriverById);
adminRouter.put("/drivers/:id", upload.single("avatar"), updateDriverDetails);

export default adminRouter;