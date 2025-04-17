import AdminModel from "../models/AdminModel.js";
import jwt from 'jsonwebtoken'

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminModel.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Admin not found." });
    }
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    console.error("Admin authentication error:", error);
    return res.status(500).json({ success: false, message: "Authentication error." });
  }
};

export default verifyAdmin;