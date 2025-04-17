import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const OTPModel = mongoose.model("OTP", otpSchema);

export default OTPModel;
