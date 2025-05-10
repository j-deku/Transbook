// backend/models/CommissionConfig.js
import mongoose from "mongoose";

const CommissionConfigSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.20, // 20% default
  },
  effectiveFrom: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Ensure only one active config
CommissionConfigSchema.index({ active: 1 });

export default mongoose.models.CommissionConfig || mongoose.model("CommissionConfig", CommissionConfigSchema);
