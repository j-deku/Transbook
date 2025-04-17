// DriverModel.js
import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    // Basic personal information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    imageUrl: { type: String },
    
    // Driver-specific information
    licenseNumber: { type: String, required: true },
    vehicle: {
      type: {
        vehicleType: { type: String, enum: ["Car", "Van", "Bus", "Motorbike", "Truck"], required: true },
        model: { type: String, required: true },
        registrationNumber: { type: String, required: true },
        capacity: { type: Number, required: true },
      },
      required: true,
    },

    // Rating and performance data
    rating: { type: Number, default: 0 },
    totalRides: { type: Number, default: 0 },

    // Verification and status
    status: { type: String, enum: ["pending", "active", "inactive"], default: "pending" },
    approved: { type: Boolean, default: false }, // New field to track admin approval
    documents: [
      {
        type: String,
      },
    ],

    // Geo-location for real-time tracking (optional)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

const DriverModel = mongoose.models.Driver || mongoose.model("Driver", DriverSchema);
export default DriverModel;
