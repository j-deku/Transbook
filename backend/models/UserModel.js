// userModel.js
import mongoose from "mongoose";

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    avatar: { type: String },
    cartData: { type: Object, default: {} },
    googleId: { type: String, unique: true, sparse: true },
    verified: { type: Boolean, default: false },
    resetToken: String,  // Stores the reset token
    resetTokenExpires: Date, // Expiration time for reset token
    refreshTokens: [{
      token:       { type: String, required: true },
      createdAt:   { type: Date,   default: Date.now },
      revoked:     { type: Boolean, default: false },
      expiresAt:   { type: Date },
    }],  
    // Role field differentiates regular users
    role: { 
      type: String, 
      enum: ["user", "driver", "admin"], 
      default: "user" 
    },
    fcmToken: { type: String, default: "", unique: true, sparse: true, require:true }, // Firebase Cloud Messaging token
  },
  { timestamps: true }
);

// Add Index for Optimized Search
userSchema.index();

const userModel = mongoose.models.user || mongoose.model("User", userSchema);
export default userModel;
