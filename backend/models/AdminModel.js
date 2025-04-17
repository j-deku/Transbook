// AdminModel.js
import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // Add this line
  resetToken: String,  // Stores the reset token
  resetTokenExpires: Date // Expiration time for reset token
});

const AdminModel = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
export default AdminModel;
