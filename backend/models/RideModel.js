import mongoose from "mongoose";

// Utility: strip accents and lowercase
function stripAccents(s = "") {
  return s
    .normalize("NFD")                   // decompose accents
    .replace(/[\u0300-\u036f]/g, "")    // remove diacritical marks
    .toLowerCase()                      // lowercase for uniformity
    .trim();                            // trim whitespace
}

// Distance helper (km)
function calculateDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  const R = 6371;
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
    // --- Original fields ---
    pickup:      { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    price:       { type: Number, required: true },
    currency:    { 
      type: String, 
      enum: ["USD","EUR","GBP","NGN","KES", "CFA", "GHC"/* etc */], 
      default: "USD", 
      required: true 
    },
        // in your RideSchema definition
    commissionRate:   { type: Number, required: true },  // e.g. 0.20
    commissionAmount: { type: Number, required: true },  // price * commissionRate
    payoutAmount:     { type: Number, required: true },  // price – commissionAmount
    
    description: { type: String, required: true },
    selectedDate:{ type: Date,   required: true },
    selectedTime:{ type: String, required: true },
    passengers:  { type: Number, required: true, min: 1 },
    imageUrl:    { type: String },
    type:        { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending approval","approved","partially approved","declined",
        "scheduled","assigned","in progress","completed"
      ],
      default: "scheduled",
    },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },

    // --- Geospatial fields ---
    pickupLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },
    destinationLocation: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },

    // --- Computed ---
    distance: { type: Number },
    duration: { type: String },

    // --- Audit trail ---
    fareHistory: [
      {
        previousFare: { type: Number },
        updatedFare:  { type: Number },
        calculatedExpectedFare: { type: Number },
        updatedAt:    { type: Date, default: Date.now },
      },
    ],

    // --- Normalized for accent- and case-insensitive search (required!) ---
    pickupNorm:      { type: String, required: true, index: true },
    destinationNorm: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// ── 1) Populate normalized fields before validation ────────────────────────────
RideSchema.pre("validate", function (next) {
  this.pickupNorm      = stripAccents(this.pickup);
  this.destinationNorm = stripAccents(this.destination);
  next();
});

// ── 2) Calculate distance & duration before saving ────────────────────────────
RideSchema.pre("save", function (next) {
  if (
    this.pickupLocation?.coordinates?.length === 2 &&
    this.destinationLocation?.coordinates?.length === 2
  ) {
    this.distance = calculateDistance(
      this.pickupLocation.coordinates,
      this.destinationLocation.coordinates
    );
    const avgSpeed = 40; // km/h
    const totalMin = Math.round((this.distance / avgSpeed) * 60);
    const hrs = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    this.duration = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }
  next();
});

// ── 3) Expected fare helper ──────────────────────────────────────────────────
RideSchema.methods.calculateExpectedFare = function (
  baseFare, ratePerMile, ratePerMinute, surgeMultiplier = 1
) {
  const dist = this.distance || 0;
  const avgSpeed = 40;
  const estMinutes = (dist / avgSpeed) * 60;
  const fareNoSurge = baseFare + dist * ratePerMile + estMinutes * ratePerMinute;
  return fareNoSurge * surgeMultiplier;
};

export default mongoose.models.Ride || mongoose.model("Ride", RideSchema);
