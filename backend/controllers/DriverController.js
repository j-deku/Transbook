import RideModel from "../models/RideModel.js";
import DriverModel from "../models/DriverModel.js";
import BookingModel from "../models/BookingModel.js";
import userModel from "../models/UserModel.js";
import validator from "validator";
import bcrypt from 'bcryptjs' // Ensure this is imported
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto";
import jwt from 'jsonwebtoken'
import { io } from "../sever.js"; // Import socket.io instance
import {sendPushNotification} from "../utils/sendPushNotification.js"
import Notification from "../models/NotificationModel.js";
import geocodeAddress from "../utils/geocodeAddress.js";

const scheduleRideReminder = (ride) => {
  const rideTime = new Date(ride.selectedDate).getTime();
  const reminderTime = rideTime - 15 * 60 * 1000; // 15 minutes before
  const now = Date.now();
  const delay = reminderTime - now;
  if (delay > 0) {
    setTimeout(() => {
      // Emit a reminder event to the driver's room
      io.to(ride.driver.toString()).emit("rideReminder", { ride });
      console.log("Sent ride reminder for ride:", ride._id);
    }, delay);
  }
};

/**
 * GET /api/driver/rides
 * Returns all rides assigned to the authenticated driver.
 */
const getDriverRides = async (req, res) => {
  try {
    const rides = await RideModel.find({ driver: req.driver._id })
      .sort({ createdAt: -1 })
      .select("pickup destination price selectedDate selectedTime passengers type status");
    return res.json({ rides });
  } catch (error) {
    console.error("Error fetching driver rides:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// at top with your other imports:
const getRideById = async (req, res) => {
  try {
    const ride = await RideModel.findById(req.params.id)
      .select("-__v");   // exclude internal fields
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
    // ensure it belongs to this driver:
    if (ride.driver.toString() !== req.driver._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    return res.json({ success: true, ride });
  } catch (err) {
    console.error("Error in getRideById:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateRide = async (req, res) => {
  try {
    const rideId = req.params.id;

    // 1. Find the ride and ensure it belongs to this driver
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
    if (ride.driver.toString() !== req.driver._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this ride" });
    }

    // 2. If you allow updating the image:
    if (req.file) {
      ride.imageUrl = req.file.path;
    }

    // 3. Update allowed fields
    const allowedUpdates = [
      "pickup",
      "destination",
      "price",
      "description",
      "selectedDate",
      "selectedTime",
      "passengers",
      "type",
      "status",
    ];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        ride[field] = req.body[field];
      }
    });

    // 4. (Optional) Re-geocode if pickup or destination changed
    if (req.body.pickup || req.body.destination) {
      const [newPickup, newDest] = await Promise.all([
        req.body.pickup ? geocodeAddress(req.body.pickup) : null,
        req.body.destination ? geocodeAddress(req.body.destination) : null,
      ]);
      if (newPickup) {
        ride.pickupLocation = {
          type: "Point",
          coordinates: [newPickup.longitude, newPickup.latitude],
        };
      }
      if (newDest) {
        ride.destinationLocation = {
          type: "Point",
          coordinates: [newDest.longitude, newDest.latitude],
        };
      }
    }

    // 5. Save and return the updated ride
    await ride.save();
    return res.json({ success: true, message: "Ride updated successfully", ride });

  } catch (error) {
    console.error("Error in updateRide:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
/**
 * POST /api/driver/ride/status
 * Allows the driver to update the status of an assigned ride.
 */
const updateRideStatusDriver = async (req, res) => {
  try {
    const { rideId, status } = req.body;
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
    if (ride.driver.toString() !== req.driver._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this ride" });
    }
    ride.status = status;
    await ride.save();
    return res.status(200).json({ success: true, message: "Ride status updated successfully", ride });
  } catch (error) {
    console.error("Error updating ride status:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PUT /api/driver/profile
 * Allows the driver to update their own profile.
 */
const updateDriverProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }
    const updatedDriver = await DriverModel.findByIdAndUpdate(req.driver._id, updateData, { new: true });
    if (!updatedDriver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }
    return res.status(200).json({ success: true, message: "Profile updated successfully", driver: updatedDriver });
  } catch (error) {
    console.error("Error updating driver profile:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const registerDriver = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      licenseNumber,
      vehicleType,
      model,
      registrationNumber,
      capacity,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !licenseNumber ||
      !vehicleType ||
      !model ||
      !registrationNumber ||
      !capacity
    ) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingDriver = await DriverModel.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ success: false, message: "Driver with this email already registered.\n Please login" });
    }

        if (!validator.isEmail(email)) {
          return res.json({ success: false, message: "Invalid email format" });
        }
    
        if (!validator.isStrongPassword(password)) {
          return res.json({
            success: false,
            message:
              "Password must be at least 8 characters long and include uppercase, lowercase, and a special character.",
          });
        }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const imageUrl = req.file ? req.file.path : "";

    const vehicle = {
      vehicleType,
      model,
      registrationNumber,
      capacity: Number(capacity),
    };

    // Create new driver with approved set to false by default
    const newDriver = new DriverModel({
      name,
      email,
      password: hashedPassword,
      phone,
      imageUrl,
      licenseNumber,
      vehicle,
      approved: false, // driver must be approved by an admin before they can log in
      status: "pending", // this can be used to signal pending approval
    });

    await newDriver.save();

    return res.status(201).json({
      success: true,
      message: "Driver registered successfully. Please wait for admin approval.",
      driver: newDriver,
      driverId: newDriver._id,
    });
  } catch (error) {
    console.error("Error registering driver:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Find driver by email
    const driver = await DriverModel.findOne({ email });
    if (!driver) {
      return res.status(401).json({ success: false, message: "Not authorized login. Please register first." });
    }

    // Check if the driver's account has been approved by admin
    if (!driver.approved) {
      return res.status(403).json({ success: false, message: "Your account is pending admin approval." });
    }
    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      return res.status(404).json({ success: false, message: "Password mismatch. Input the right password" });
    }

    // Create JWT token (expires in 1 day)
    const token = jwt.sign(
      { id: driver._id, email: driver.email, role: "driver" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      driver, // Optional: return driver details if needed
    });
  } catch (error) {
    console.error("Driver login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// ====================
// Forgot Password
// ====================
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const driver = await DriverModel.findOne({ email });
    if (!driver) return res.status(404).json({ message: "Admin not found" });

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    driver.resetToken = hashedToken;
    driver.resetTokenExpires = Date.now() + 3600000; // 1-hour expiration
    await driver.save();

    // Email transporter configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials are missing");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetLink = `${process.env.DRIVER_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: driver.email,
      subject: "Driver Password Reset",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 1 hour.</p>`,
    });

    res.json({ message: "Password reset email sent ✅" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ====================
// Reset Password Using Token
// ====================
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const driver = await DriverModel.findOne({ 
      resetToken: hashedToken, 
      resetTokenExpires: { $gt: Date.now() } 
    });
    if (!driver) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    driver.password = hashedPassword;
    driver.resetToken = null;
    driver.resetTokenExpires = null;
    await driver.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// In your addRide function:
const addRide = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    // 1) Geocode addresses
    const pickupCoords = await geocodeAddress(req.body.pickup);
    const destCoords   = await geocodeAddress(req.body.destination);

    // 2) Instantiate (pre-validate hook will fill normalized fields)
    const ride = new RideModel({
      pickup: req.body.pickup,
      destination: req.body.destination,
      price: Number(req.body.price),
      description: req.body.description,
      selectedDate: new Date(req.body.selectedDate),
      selectedTime: req.body.selectedTime,
      passengers: Number(req.body.passengers),
      imageUrl: req.file.path,
      type: req.body.type,
      status: req.body.status || "scheduled",
      driver: req.driver._id,
      pickupLocation: {
        type: "Point",
        coordinates: [pickupCoords.longitude, pickupCoords.latitude],
      },
      destinationLocation: {
        type: "Point",
        coordinates: [destCoords.longitude, destCoords.latitude],
      },
    });

    // 3) Save (triggers validate → normalize → save)
    await ride.save();
    return res.json({ success: true, message: "Ride added successfully", ride });

  } catch (error) {
    console.error("Error in addRide:", error);
    if (error.name === "ValidationError") {
      const msgs = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: msgs.join("; ") });
    }
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const getCurrentRide = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    // Query for a ride in various statuses
    const ride = await RideModel.findOne({
      driver: driver._id,
      status: { $in: ["assigned", "in progress", "approved", "pending approval"] },
    });
    if (!ride) {
      // Return a 200 with a null ride, so the client can handle it gracefully
      return res.status(200).json({ success: true, ride: null, message: "No active ride found." });
    }
    ride.save()
    return res.status(200).json({ success: true, ride });
  } catch (error) {
    console.error("Error fetching current ride:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCurrentRides = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    // Retrieve all active rides assigned to the driver
    const rides = await RideModel.find({
      driver: driver._id,
      status: { $in: ["assigned"] },
    });
    if (!rides || rides.length === 0) {
      // Return 200 with an empty array instead of a 404 error
      return res.status(200).json({ success: true, rides: [], message: "No active rides found." });
    }

    return res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error("Error fetching current rides:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// POST /api/driver/ride/start
// Allows a driver to start a ride by updating its status from "Scheduled" to "In Progress".
const startRide = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    const { rideId } = req.body;
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }
    if (ride.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this ride." });
    }
    // Allow ride to be started if its status is either "scheduled" or "assigned"
    const currentStatus = ride.status.toLowerCase();
    if (currentStatus !== "scheduled" && currentStatus !== "assigned") {
      return res.status(400).json({ success: false, message: "Ride cannot be started." });
    }
    ride.status = "in progress";
    await ride.save();
    return res.status(200).json({ success: true, message: "Ride started successfully.", ride });
  } catch (error) {
    console.error("Error starting ride:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/driver/ride/complete
// Allows a driver to mark a ride as completed.
const completeRide = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    const { rideId } = req.body;
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }
    if (ride.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this ride." });
    }
    if (ride.status.toLowerCase() !== "in progress") {
      return res.status(400).json({ success: false, message: "Ride cannot be completed. Please start the ride first." });
    }
    ride.status = "completed";
    await ride.save();
    return res.status(200).json({ success: true, message: "Ride completed successfully", ride });
  } catch (error) {
    console.error("Error completing ride:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/driver/ride/cancel
// Allows a driver to cancel a ride if it hasn't been completed.
const cancelRide = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    const { rideId } = req.body;
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }
    if (ride.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this ride." });
    }
    // Prevent cancelling a ride that is already completed.
    if (ride.status === "completed") {
      return res.status(400).json({ success: false, message: "Completed rides cannot be cancelled." });
    }
    ride.status = "declined";
    await ride.save();
    return res.status(200).json({ success: true, message: "Ride cancelled successfully.", ride });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUpcomingRides = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    const now = new Date();
    // Retrieve rides scheduled for the future; you might adjust statuses as needed
    const rides = await RideModel.find({
      driver: driver._id,
      status: { $in: [ "scheduled"] },
      selectedDate: { $gte: now }
    });
    return res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error("Error fetching upcoming rides:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getDriverEarnings = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // assuming Sunday start; adjust as needed
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Aggregate earnings from rides completed in each period
    const [todayResult, weekResult, monthResult] = await Promise.all([
      RideModel.aggregate([
        { $match: {
            driver: driver._id,
            status: "completed",
            updatedAt: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 24*60*60*1000) }
          }
        },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]),
      RideModel.aggregate([
        { $match: {
            driver: driver._id,
            status: "completed",
            updatedAt: { $gte: startOfWeek, $lt: new Date(startOfWeek.getTime() + 7*24*60*60*1000) }
          }
        },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]),
      RideModel.aggregate([
        { $match: {
            driver: driver._id,
            status: "completed",
            updatedAt: { $gte: startOfMonth, $lt: new Date(now.getFullYear(), now.getMonth()+1, 1) }
          }
        },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ])
    ]);

    const todayEarnings = todayResult.length > 0 ? todayResult[0].total : 0;
    const weekEarnings = weekResult.length > 0 ? weekResult[0].total : 0;
    const monthEarnings = monthResult.length > 0 ? monthResult[0].total : 0;
    
    return res.status(200).json({
      success: true,
      earnings: {
        today: todayEarnings,
        week: weekEarnings,
        month: monthEarnings,
      },
    });
  } catch (error) {
    console.error("Error fetching driver earnings:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPerformanceMetrics = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }

    // Aggregate metrics for rides completed by the driver.
    // This example assumes that "completed" rides have status "completed".
    const metrics = await RideModel.aggregate([
      {
        $match: {
          driver: driver._id,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: 1 },
          totalFare: { $sum: "$price" },
          avgFare: { $avg: "$price" },
          avgDuration: { $avg: "$duration" }, // Assumes a "duration" field (in minutes) exists
        },
      },
    ]);

    let result = {
      totalCompleted: 0,
      averageFare: 0,
      averageDuration: null,
    };

    if (metrics.length > 0) {
      result.totalCompleted = metrics[0].totalCompleted;
      result.averageFare = metrics[0].avgFare;
      result.averageDuration = metrics[0].avgDuration; // May be null if duration isn't stored
    }

    return res.status(200).json({ success: true, metrics: result });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Endpoint: GET /api/driver/rating
// Returns the average rating and total number of ratings for completed rides.
const getDriverRating = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }

    // Aggregate ratings from rides that are completed and have a rating value
    const ratingResult = await RideModel.aggregate([
      {
        $match: {
          driver: driver._id,
          status: "completed",
          rating: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    if (ratingResult.length > 0) {
      return res.status(200).json({ success: true, rating: ratingResult[0] });
    } else {
      return res.status(200).json({
        success: true,
        rating: { avgRating: 0, totalRatings: 0 },
      });
    }
  } catch (error) {
    console.error("Error fetching driver rating:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getDriverHistory = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    // Retrieve rides that are either completed or cancelled
    const historyRides = await RideModel.find({
      driver: driver._id,
      status: { $in: ["completed", "Cancelled"] }
    }).sort({ selectedDate: -1 });
    
    return res.status(200).json({ success: true, rides: historyRides });
  } catch (error) {
    console.error("Error fetching ride history:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getDriverEarningsReport = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Aggregate earnings per day for the last 30 days
    const report = await RideModel.aggregate([
      {
        $match: {
          driver: driver._id,
          status: "completed",
          updatedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          totalEarnings: { $sum: "$price" },
          rideCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error("Error fetching earnings report:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// In DriverController.js (or SupportController.js)
const submitSupportRequest = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject and message are required." });
    }
    
    // In production, save this support request to a database or forward it via email.
    // For now, we just log it.
    console.log(`Support request from driver ${driver._id} (${driver.name}):`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    return res.status(200).json({ success: true, message: "Support request submitted successfully." });
  } catch (error) {
    console.error("Error submitting support request:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateRideFare = async (req, res) => {
  try {
    const driver = req.driver; // driver is attached by driverAuth middleware
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    const { rideId, newFare } = req.body;
    if (!rideId || newFare == null) {
      return res.status(400).json({ success: false, message: "Ride ID and new fare are required." });
    }
    
    // Find the ride
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }
    
    // Ensure the ride is assigned to this driver
    if (ride.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this ride." });
    }
    
    // Optionally, add a check to only allow fare updates when ride status is 'assigned' or 'scheduled'
    if (!["assigned", "scheduled"].includes(ride.status.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Fare cannot be updated at this stage." });
    }
    
    // Update the fare
    ride.price = newFare;
    await ride.save();
    
    return res.status(200).json({ success: true, message: "Fare updated successfully", ride });
  } catch (error) {
    console.error("Error updating ride fare:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const driverRespondToRide = async (req, res) => {
  try {
    const { rideId, response } = req.body; // response should be "approved" or "declined"
    const driver = req.driver; // Provided by driverAuth middleware

    // Find the booking containing a ride subdocument with _id === rideId
    const booking = await BookingModel.findOne({ "rides._id": rideId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Use Mongoose's subdocument accessor to retrieve the ride
    const ride = booking.rides.id(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found in booking" });
    }

    // Verify that this ride is assigned to the current driver
    if (!ride.driver || ride.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized for this ride" });
    }

    // If you want to allow updates regardless of previous response,
    // you can remove or adjust this check:
    if (ride.status !== "pending approval") {
      // For example, you might still allow re-approval if needed:
      // return res.status(200).json({ success: true, message: "Ride has already been responded to." });
      // Otherwise, uncomment the next line to prevent further changes:
      // return res.status(200).json({ success: true, message: "Ride has already been responded to." });
    }

    // Update the ride's status based on the driver's response
    if (response === "approved") {
      ride.status = "approved";
    } else if (response === "declined") {
      ride.status = "declined";
    } else {
      return res.status(400).json({ success: false, message: "Invalid response" });
    }

    // Save the booking document with the updated ride status
    await booking.save();

    // Recalculate overall booking status based on rides' statuses
    const total = booking.rides.length;
    const approvedCount = booking.rides.filter(r => r.status === "approved").length;
    if (approvedCount === total) {
      booking.status = "approved";
    } else if (approvedCount > 0) {
      booking.status = "partially approved";
    } else {
      booking.status = "pending approval";
    }
    await booking.save();

    if (booking) {
      io.to(booking.userId.toString()).emit("rideResponseUpdate", { ride, booking, response });
    }
    // Emit a socket event so the driver's UI is updated in real time
    if (response === "approved") {
      io.to(driver._id.toString()).emit("bookingApproved", { booking, rideId });
      // Send push notification
      const user = await userModel.findById(booking.userId);
      if (user && user.fcmToken) {
        await sendPushNotification(user.fcmToken, {
          title: "Ride Approved",
          body: `Hi, ${user.name} \n\n Your ride from ${ride.pickup} to ${ride.destination} has been approved 😍✅.`,
          data: { 
            rideId: ride._id.toString(), 
            bookingId: booking._id.toString(),
            type: "Ride Approved",
            tag: "Ride Approved",
            url: "/myBookings",
          }
        });
      } else {
        console.warn("User FCM token not provided; push notification not sent.");
      }
      const notificationMessage = `Your ride from ${ride.pickup} to ${ride.destination} has been approved.`;
      const newNotification = new Notification({
        userId: booking.userId,
        message: notificationMessage,
        type: "ride",
        isRead: false,
      });
      await newNotification.save();
      return res.status(200).json({ success: true, message: "Ride approved successfully", booking });
    } else {
      io.to(driver._id.toString()).emit("bookingDeclined", { bookingId: booking._id, rideId });
      booking.status = "declined";
      await booking.save();
      // Send push notification for declined ride
      const user = await userModel.findById(booking.userId);
      if (user && user.fcmToken) {
        await sendPushNotification(user.fcmToken, {
          title: "Ride Declined",
          body: `Hi, ${user.name} \n\n Your ride from ${ride.pickup} to ${ride.destination} has been declined 😒.`,
          data: { 
            rideId: ride._id.toString(), 
            bookingId: booking._id.toString(),
            type: "Ride Declined",
            tag: "Ride Declined",
            url: "/myBookings",
          }
        });
      } else {
        console.warn("User FCM token not provided; push notification not sent.");
      }
      const notificationMessage = `Your ride from ${ride.pickup} to ${ride.destination} has been cancelled.`;
      const newNotification = new Notification({
        userId: booking.userId,
        message: notificationMessage,
        type: "ride",
        isRead: false,
      });
      await newNotification.save();
      return res.status(200).json({ success: true, message: "Ride declined", booking });
    }

  } catch (error) {
    console.error("Error processing driver response:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Endpoint to get pending ride requests for the authenticated driver
const getPendingRideRequests = async (req, res) => {
  try {
    const driver = req.driver;
    if (!driver) {
      return res.status(403).json({ success: false, message: "Access denied: Not a driver." });
    }
    // Find bookings that have at least one ride with status "pending approval" assigned to this driver.
    const bookings = await BookingModel.find({
      rides: { $elemMatch: { driver: driver._id.toString(), status: "pending approval" } }
    });
    // You might want to combine rides from multiple bookings into one array, if needed.
    const pendingRides = bookings.flatMap(booking =>
      booking.rides.filter(ride => ride.driver === driver._id.toString() && ride.status === "pending approval")
    );
    return res.status(200).json({ success: true, rides: pendingRides });
  } catch (error) {
    console.error("Error fetching pending ride requests:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export { 
  getDriverRides, 
  getRideById,
  updateRide,
  updateRideStatusDriver, 
  updateDriverProfile, 
  registerDriver, 
  loginDriver,
  forgotPassword,
  resetPassword,
  addRide,
  getCurrentRide,
  getCurrentRides, 
  startRide, 
  completeRide, 
  cancelRide,  // Additional endpoints for managing rides and updating driver profile. 
  getUpcomingRides,  // Additional endpoint for retrieving upcoming rides. 
  getDriverEarnings,  // Additional endpoint for retrieving driver earnings.
  scheduleRideReminder, 
  getPerformanceMetrics,  // Additional endpoint for retrieving performance metrics.
  getDriverRating,  // Additional endpoint for retrieving driver rating.  // Additional endpoints for managing rides and updating driver profile.
  getDriverHistory,
  getDriverEarningsReport,  // Additional endpoint for retrieving driver earnings report.
  submitSupportRequest,
  updateRideFare,
  driverRespondToRide,
  getPendingRideRequests,
}