import express from "express";
import { body } from "express-validator";
import passport from 'passport'
import rateLimit from "express-rate-limit";
import {
  loginUser,
  registerUser,
  resendOTP,
  verifyOTP,
  googleAuthCallback,
  placesApi,
  forgotPassword,
  resetPassword,
  updateFCMToken,
} from "../controllers/UserController.js";
import authMiddleware from "../middlewares/auth.js";

const UserRouter = express.Router();

// Rate limiting
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: "Too many OTP attempts. Please try again later.",
});

// Validation schemas
const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateOTP = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("otp").isNumeric().withMessage("Invalid OTP"),
];

// Routes
UserRouter.post("/register", validateRegister, registerUser);
UserRouter.post("/login", validateLogin, loginUser);
UserRouter.post("/verify-otp", otpLimiter, validateOTP, verifyOTP);
UserRouter.post("/resend-otp", otpLimiter, resendOTP);
UserRouter.post("/forgot-password", forgotPassword);
UserRouter.post("/reset-password/:token", resetPassword);
UserRouter.post("/update-token", authMiddleware, updateFCMToken);

//placeApi route
UserRouter.get("/autoComplete", placesApi);
// Google OAuth routes
UserRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

UserRouter.get("/google/callback",passport.authenticate("google", {
    failureRedirect: "/api/user/google/failure",
  }),
  googleAuthCallback
);
export default UserRouter;
