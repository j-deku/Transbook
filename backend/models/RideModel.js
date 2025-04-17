import mongoose from "mongoose";

// Utility function to calculate the distance between two coordinates (in kilometers)
function calculateDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const RideSchema = new mongoose.Schema(
  {
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    selectedDate: { type: Date, required: true },
    selectedTime: { type: String, required: true }, // Start time in "HH:mm" format
    passengers: { type: Number, required: true, min: 1 },
    imageUrl: { type: String },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending approval", "approved", "partially approved", "declined", "scheduled", "assigned", "in progress", "completed"],
      default: "scheduled",
    },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    // Geo-coordinates for spatial queries
    pickupLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },
    destinationLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },
    distance: { type: Number },
    duration: { type: String }, // Duration in "HH:mm" format
    // New field: an array to store fare history entries for auditing
    fareHistory: [
      {
        previousFare: { type: Number },
        updatedFare: { type: Number },
        calculatedExpectedFare: { type: Number },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to calculate distance and duration based on coordinates
RideSchema.pre("save", function (next) {
  if (
    this.pickupLocation &&
    Array.isArray(this.pickupLocation.coordinates) &&
    this.pickupLocation.coordinates.length === 2 &&
    this.destinationLocation &&
    Array.isArray(this.destinationLocation.coordinates) &&
    this.destinationLocation.coordinates.length === 2
  ) {
    // Calculate distance
    this.distance = calculateDistance(
      this.pickupLocation.coordinates,
      this.destinationLocation.coordinates
    );
    // Compute duration based on an assumed average speed (e.g., 40 km/h)
    const avgSpeed = 40; // km per hour
    const totalMinutes = Math.round((this.distance / avgSpeed) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    // Format as "HH:mm"
    this.duration = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  next();
});

/**
 * Instance method to calculate the expected fare based on:
 *  - baseFare: Flat starting charge.
 *  - ratePerMile: Additional charge per kilometer (or mile).
 *  - ratePerMinute: Additional charge per minute (estimated from distance/average speed).
 *  - surgeMultiplier: Optional multiplier for surge pricing.
 */
RideSchema.methods.calculateExpectedFare = function (
  baseFare,
  ratePerMile,
  ratePerMinute,
  surgeMultiplier = 1
) {
  // Use the ride's pre-calculated distance; if not available, default to 0
  const distance = this.distance || 0;
  // Assume an average speed to estimate duration in minutes (for instance, 40 km/h)
  const avgSpeed = 40; // km/h
  const estimatedTimeMinutes = (distance / avgSpeed) * 60;
  
  const fareWithoutSurge = baseFare + (distance * ratePerMile) + (estimatedTimeMinutes * ratePerMinute);
  return fareWithoutSurge * surgeMultiplier;
};

const RideModel = mongoose.models.ride || mongoose.model("ride", RideSchema);
export default RideModel;
