import mongoose from "mongoose";

// Supported currencies (ISO 4217)
const CURRENCY_CODES = ["USD","EUR","GBP","NGN","KES","NGN", "CFA","GHC"];

// Define an Address subdocument schema
const AddressSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  { _id: false }
);

// Define a subdocument schema for a ride within a booking
const RideSchema = new mongoose.Schema(
  {
    _id: { 
      type: String, 
      default: () => new mongoose.Types.ObjectId().toString() 
    },
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    price: { type: Number, required: true },
    currency: {
      type: String,
      enum: CURRENCY_CODES,
      default: "USD",
      required: true
    },
    description: { type: String, required: true },
    selectedDate: { type: Date, required: true },
    selectedTime: { type: String, required: true },
    passengers: { type: Number, required: true, min: 1 },
    imageUrl: { type: String },
    type: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["pending approval", "scheduled", "approved", "declined", "assigned", "in progress", "completed"],
      default: "pending approval" 
    },
    driver: { type: String, required: true }
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    rides: { type: [RideSchema], required: true },
    amount: { type: Number, required: true },
    currency: {
      type: String,
      enum: CURRENCY_CODES,
      default: "USD",
      required: true
    },
    address: { type: AddressSchema, required: true },
    status: { 
      type: String, 
      enum: ["pending approval", "approved","partially approved", "declined", "in progress", "completed"],
      default: "pending approval"
    },
    payment: { type: Boolean, default: false },
    email: { type: String, required: true },
    bookingDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const BookingModel = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
export default BookingModel;
