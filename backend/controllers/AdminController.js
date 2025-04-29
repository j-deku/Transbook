import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import AdminModel from "../models/AdminModel.js";
import RideModel from "../models/RideModel.js";
import userModel from "../models/UserModel.js";
import DriverModel from "../models/DriverModel.js"; // Dedicated Driver model
import BookingModel from "../models/BookingModel.js";
import geocodeAddress from "../utils/geocodeAddress.js";
import { io } from "../sever.js";

dotenv.config();

// ====================
// Ensure Super Admin Exists (with upsert)
// ====================
export async function ensureSuperAdminExists() {
  try {
    // Hash the password from your environment variable
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 12);

    // Prepare the update object
    const update = {
      email: process.env.ADMIN_EMAIL,   // Ensures the email is stored correctly.
      password: hashedPassword,
      role: "super-admin",              // Set or update to super-admin
    };

    // Upsert options: create if not exists, and return the updated/created document
    const options = {
      new: true,              // Return the updated document.
      upsert: true,           // Create the document if it does not exist.
      setDefaultsOnInsert: true,
    };

    // Modify filter: Use only 'email' as the filter to avoid duplicate key issues.
    const superAdmin = await AdminModel.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL },
      update,
      options
    );

    console.log("✅ Super Admin ensured (created or updated)", superAdmin.email);
  } catch (error) {
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      console.log("✅ Super Admin already exists (duplicate key detected)");
    } else {
      console.error("❌ Error ensuring Super Admin:", error);
    }
  }
}


// ====================
// Admin Login
// ====================
const AdminLogin = async (req, res) => {
  const { email, password } = req.body;
  
  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    // Find admin by email
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Not authorized login here." });
    }
    
    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(402).json({ success: false, message: "Invalid credentials. \n Password mismatch" });
    }
    
    // Create a JWT token (expires in 1 day)
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    return res.status(200).json({ success: true, message: "Login successful.", token });
  } catch (err) {
    console.error("AdminLogin error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ====================
// Forgot Password
// ====================
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await AdminModel.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    admin.resetToken = hashedToken;
    admin.resetTokenExpires = Date.now() + 3600000; // 1-hour expiration
    await admin.save();

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

    const resetLink = `${process.env.ADMIN_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: admin.email,
      subject: "Admin Password Reset",
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

    const admin = await AdminModel.findOne({ 
      resetToken: hashedToken, 
      resetTokenExpires: { $gt: Date.now() } 
    });
    if (!admin) return res.status(400).json({ message: "Invalid or expired token" });

    // Hash the new password and update admin record
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    admin.password = hashedPassword;
    admin.resetToken = null;
    admin.resetTokenExpires = null;
    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ====================
// Dashboard Statistics
// ====================
const getDashboardStats = async (req, res) => {
  try {
    // Total Bookings
    const totalBookings = await BookingModel.countDocuments();

    // Total Revenue: sum the 'amount' from each booking
    const revenueResult = await BookingModel.aggregate([
       {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Total Rides
    const totalRides = await RideModel.countDocuments();

    // Total Users
    const totalUsers = await userModel.countDocuments();

    const totalDrivers = await DriverModel.countDocuments();
    return res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        totalRides,
        totalUsers,
        totalDrivers,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard stats.",
    });
  }
};

// ====================
// Get Monthly Revenue
// ====================
const getMonthlyRevenue = async (req, res) => {
  try {
    const monthlyRevenue = await BookingModel.aggregate([
      {
        $group: {
          _id: { $month: "$bookingDate" },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          month: "$_id",
          revenue: 1,
          _id: 0,
        },
      },
    ]);
    return res.status(200).json({ success: true, data: monthlyRevenue });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ====================
// Booking Status Distribution (for a Pie Chart)
// ====================
const getBookingStatusDistribution = async (req, res) => {
  try {
    const statusData = await BookingModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          value: "$count",
          _id: 0,
        },
      },
    ]);
    return res.status(200).json({ success: true, data: statusData });
  } catch (error) {
    console.error("Error fetching booking status distribution:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
 
// ====================
// Get Monthly Bookings (for a Bar Chart)
// ====================
const getMonthlyBookings = async (req, res) => {
  try {
    const monthlyBookings = await BookingModel.aggregate([
      {
        $group: {
          _id: { $month: "$bookingDate" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          month: "$_id",
          bookings: 1,
          _id: 0,
        },
      },
    ]);
    return res.status(200).json({ success: true, data: monthlyBookings });
  } catch (error) {
    console.error("Error fetching monthly bookings:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ====================
// Ride Management Endpoints
// ====================

// Get all rides (with driver details)
const getAllRides = async (req, res) => {
  try {
    const rides = await RideModel.find().populate("driver", "name email");
    res.json({ rides });
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get a specific ride by its ID
const getRideById = async (req, res) => {
  try {
    const ride = await RideModel.findById(req.params.id).populate("driver", "name email");
    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }
    res.json({ ride });
  } catch (error) {
    console.error("Error fetching ride:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Assign a ride to a driver
const assignRideToDriver = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    
    // Validate that the ride exists
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }
    
    // Validate that the driver exists using the DriverModel
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }
    
    // Check how many active rides the driver already has
    const activeRidesCount = await RideModel.countDocuments({
      driver: driverId,
      status: { $in: ["scheduled", "in progress", "assigned", "pending approval"] },
    });
    if (activeRidesCount >= 4) {
      return res.status(400).json({ message: "Driver already has maximum active rides assigned." });
    }   
    
    // Assign the ride to the driver and update status to "assigned"
    ride.driver = driverId;
    ride.status = "assigned";
    await ride.save();
    
    // Emit a ride update event to the driver's room for real-time notifications
    io.to(driverId.toString()).emit("rideUpdate", { ride });
    console.log(`Emitted rideUpdate event to driver ${driverId}`);

    res.json({ message: "Ride assigned successfully.", ride });
  } catch (error) {
    console.error("Error assigning ride:", error);
    res.status(500).json({ message: "Server error." });
  }
};
// Update a ride's status
const updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ride = await RideModel.findById(id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }
    ride.status = status;
    await ride.save();
    res.json({ message: "Ride status updated.", ride });
  } catch (error) {
    console.error("Error updating ride status:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all drivers (from the DriverModel)
const getAllDrivers = async (req, res) => {
  try {
    // Include approved and status fields in the selection
    const drivers = await DriverModel.find({}).select("name email imageUrl phone licenseNumber approved status vehicle");
    res.json({ drivers });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// driverController.js
const approveDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    // Approve the driver and update status to active
    driver.approved = true;
    driver.status = "active";
    await driver.save();

    return res.status(200).json({ success: true, message: "Driver approved successfully" });
  } catch (error) {
    console.error("Error approving driver:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await BookingModel.find();
    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// In your addRide function:
const addRide = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    // Geocode the pickup and destination addresses
    let pickupCoords, destinationCoords;
    try {
      pickupCoords = await geocodeAddress(req.body.pickup);
      destinationCoords = await geocodeAddress(req.body.destination);
    } catch (geoError) {
      return res.status(400).json({ success: false, message: geoError.message });
    }

    const ride = new RideModel({
      pickup: req.body.pickup,
      destination: req.body.destination,
      price: req.body.price,
      description: req.body.description,
      selectedDate: req.body.selectedDate, // e.g., "2025-02-07"
      selectedTime: req.body.selectedTime,   // e.g., "14:30"
      passengers: req.body.passengers,
      imageUrl: req.file.path,               // Cloudinary or local URL
      type: req.body.type,
      status: req.body.status || "scheduled",
      driver: req.body.driver,
      // Store coordinates as GeoJSON Points
      pickupLocation: {
        type: "Point",
        coordinates: [pickupCoords.longitude, pickupCoords.latitude],
      },
      destinationLocation: {
        type: "Point",
        coordinates: [destinationCoords.longitude, destinationCoords.latitude],
      },
    });

    await ride.save();
    return res.json({ success: true, message: "Ride added successfully", ride });
  } catch (error) {
    console.error("Error in addRide:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// List all rides (unprotected listing endpoint)
const listRide = async (req, res) => {
  try {
    const ride = await RideModel.find({});
    res.json({ success: true, data: ride });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const removeRide = async (req, res) => {
  try {
    // Verify admin authentication
    const admin = await AdminModel.findById(req.admin.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await RideModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Ride Removed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};


// Search rides based on query parameters
const rideSearch = async (req, res) => {
  try {
    const { pickup, destination, selectedDate, passengers } = req.query;
    if (!pickup || !destination || !selectedDate || !passengers) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Convert date to range for searching
    const searchDate = new Date(selectedDate);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const rides = await RideModel.find({
      pickup: new RegExp(pickup, "i"), // Case-insensitive
      destination: new RegExp(destination, "i"),
      selectedDate: { $gte: startOfDay, $lte: endOfDay },
      passengers: { $gte: parseInt(passengers) },
    });

    if (!rides.length) {
      return res.status(404).json({ message: "No rides found" });
    }

    res.json(rides);
  } catch (error) {
    console.error("Error searching rides:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addDriver = async (req, res) => {
  try {
    // Destructure required fields from the request body
    const { name, email, password, phone, licenseNumber, vehicleType, model, registrationNumber, capacity } = req.body;
    
    // Basic validation: check if all required fields are provided
    if (!name || !email || !password || !phone || !licenseNumber || !vehicleType || !model || !registrationNumber || !capacity) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    // Check if a driver with the same email already exists
    const existingDriver = await DriverModel.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ success: false, message: "Driver with this email already exists" });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // If an avatar image file is uploaded via Multer, get its path; otherwise, use an empty string (or a default URL)
    const imageUrl = req.file ? req.file.path : "";
    
    // Create a new driver document using the provided fields
    const newDriver = new DriverModel({
      name,
      email,
      password: hashedPassword,
      phone,
      licenseNumber,
      imageUrl,
      vehicle: {
        vehicleType,
        model,
        registrationNumber,
        capacity: Number(capacity),
      },
      // You can set the default status as needed (e.g., "pending" or "active")
      status: "pending",
    });
    
    await newDriver.save();
    
    return res.status(201).json({ success: true, message: "Driver added successfully", driver: newDriver });
  } catch (error) {
    console.error("Error adding driver:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateRideDetails = async (req, res) => {
  try {
    const { id } = req.params;
    // Gather update data from req.body
    const updateData = { ...req.body };

    // If a new image is uploaded, update the imageUrl field accordingly.
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    // Optionally, you can process fields such as selectedDate if needed:
    if (updateData.selectedDate) {
      updateData.selectedDate = new Date(updateData.selectedDate);
    }

    const updatedRide = await RideModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedRide) {
      return res.status(404).json({ message: "Ride not found." });
    }
    res.json({ success: true, message: "Ride updated successfully.", ride: updatedRide });
  } catch (error) {
    console.error("Error updating ride:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// UPDATE DRIVER DETAILS (Admin Only)

const updateDriverDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the provided id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid driver ID." });
    }

    const updateData = { ...req.body };

    // If a new avatar image is uploaded, update the 'imageUrl' field (not 'avatar')
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedDriver = await DriverModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found." });
    }
    res.json({ success: true, message: "Driver updated successfully.", driver: updatedDriver });
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate the provided id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid driver ID." });
    }

    const driver = await DriverModel.findById(id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }
    res.json({ driver });
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export { 
  AdminLogin, 
  forgotPassword, 
  resetPassword, 
  getDashboardStats, 
  getMonthlyRevenue, 
  getBookingStatusDistribution, 
  getMonthlyBookings,
  getAllRides, 
  getRideById, 
  getDriverById,
  assignRideToDriver, 
  updateRideStatus, 
  getAllDrivers,
  approveDriver,
  getAllBookings,
  addRide,
  listRide,
  removeRide, 
  rideSearch,
  addDriver,
  updateRideDetails,
  updateDriverDetails,  // Admin-only endpoints
};
