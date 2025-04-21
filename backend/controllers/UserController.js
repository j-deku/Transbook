import userModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import validator from "validator";
import fetch from "node-fetch";
import OTPModel from "../models/OTPModel.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  EmailOTP,
  EmailWelcome,
  ResendEmail,
  VerifiedEmail,
} from "../utils/EmailTemplates.js";
import { sendPushNotification } from "../utils/sendPushNotification.js";
import Notification from "../models/NotificationModel.js";
dotenv.config();

// Create token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register user
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, and a special character.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      ...(req.body.googleId && { googleId: req.body.googleId }),
      password: hashedPassword,
      verified: false,
    });

    const user = await newUser.save();

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await sendEmail(
        user.email,
        "Email Verification 🚌",
        EmailOTP(user.name, otp)
      );
      await OTPModel.create({ userId: user._id, otp, expiresAt });

      // Send push notification
      if (user.fcmToken) {
        const pushPayload = {
          title: `Welcome to TOLI-TOLI, ${user.name}!`,
          body: "Book Your Ride, Get Your Receipt. Explore our Menu to book your rides now!😊🚗.",
          data: {
            type: "register",
            tag: "register",
            url: "/", // Direct the user to their dashboard
          },
        };

        try {
          await sendPushNotification(user.fcmToken, pushPayload);
          console.log("Push notification sent successfully on lvb gin.");
        } catch (pushError) {
          console.error("Error sending push notification:", pushError);
        }
      } else {
        console.warn("User FCM token not found; push notification not sent.");
      }

      res.json({
        success: true,
        message: "OTP sent to your email",
        redirect: "/verify-otp",
        userId: user._id,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      await userModel.findByIdAndDelete(user._id);
      return res.json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Network Unstable" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { userId, otp, token } = req.body;
  try {
    let user;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await userModel.findById(decoded.id);
    } else {
      user = await userModel.findById(userId);
    }

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (token || (await OTPModel.findOne({ userId, otp }))) {
      user.verified = true;
      await user.save();
      await OTPModel.deleteOne({ userId });

      await sendEmail(
        user.email,
        "Successful Verification 🚌",
        VerifiedEmail(user.name)
      );
      const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
      const redirectUrl = `${FRONTEND_URL}/?name=${encodeURIComponent(
        user.name
      )}&email=${encodeURIComponent(user.email)}`;
      return res.json({
        success: true,
        message: "Email verified successfully",
        redirect: redirectUrl,
        token: createToken(user._id),
        user: { name: user.name, email: user.email },
      });
    }

    res.json({ success: false, message: "Invalid OTP" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Network Unstable" });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verified) {
      return res.json({ success: false, message: "User already verified" });
    }

    const otp = generateOTP();
    const token = createToken(user._id);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-otp?token=${token}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await sendEmail(
      user.email,
      "Email Verification 🚌",
      ResendEmail(user.name, otp, verificationUrl)
    );
    await OTPModel.updateOne({ userId: user._id }, { otp, expiresAt });

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Network Unstable" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email. \n Please register first.",
      });
    }

    if (!user.verified) {
      return res.json({
        success: false,
        message: "Please verify your email to continue.",
        redirect: "/verify-otp",
      });
    }

    if (!user.password) {
      return res.json({
        success: false,
        message:
          "This account was created using Google. Please use Google login.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user._id);
    await sendEmail(email, "Welcome Back 🚌", EmailWelcome(user.name));

    // Send push notification
    if (user.fcmToken) {
      const pushPayload = {
        title: `Welcome back, ${user.name}!`,
        body: "You have successfully logged in into TOLI-TOLI. Check out your dashboard for updates😊😊.",
        data: {
          type: "login",
          tag: "login",
          url: "/myBookings", // Direct the user to their booking dashboard
        },
      };

            const notificationMessage = `Hi ${user.name}! Welcome back to TOLI-TOLI. We missed you alot☺️`;
            const newNotification = new Notification({
              userId: user.id,
              message: notificationMessage,
              type: "login",
              isRead: false,
            });
            await newNotification.save();

      try {
        await sendPushNotification(user.fcmToken, pushPayload);
        console.log("Push notification sent successfully on login.");
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
    } else {
      console.warn("User FCM token not found; push notification not sent.");
    }

    res.json({
      success: true,
      token,
      message: "Login Successful!",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// ✅ Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User account not found" });

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1-hour expiration
    await user.save();

    // Email transporter
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP credentials are missing");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      subject: "User Password Reset",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 1 hour.</p>`,
    });

    res.json({ message: "Password reset email sent ✅" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ✅ Reset Password Using Token
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const googleAuthCallback = async (req, res) => {
  try {
    console.log("Google Profile Data:", req.user);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Google authentication failed",
      });
    }

    const { id: googleId, displayName, emails, photos } = req.user;
    const email = emails?.[0]?.value || null;
    const name = displayName || "Google User";
    const avatar = photos?.[0]?.value || "";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Required user information (email) is missing",
      });
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name,
        email,
        avatar,
        googleId,
        verified: true,
      });
    }

    const token = createToken(user._id);
    await sendEmail(email, "Welcome Back 🚌", EmailWelcome(user.name));

    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

    res.redirect(
      `${frontendURL}/?token=${token}&name=${encodeURIComponent(
        user.name
      )}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(
        avatar
      )}`
    );
  } catch (error) {
    console.error("Error during Google authentication:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Google login failure
const googleAuthFailure = (req, res) => {
  res.status(401).json({
    success: false,
    message: "Failed to authenticate with Google",
  });
  console.error("Google authentication failed:", req.query.error);
  // Redirect to login page with error message
  res.redirect(process.env.FRONTEND_URL + "/?error=google_auth_failed");
};

//placesApi
//PlacesApi key
const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API;

const placesApi = async (req, res) => {
  const input = req.query.input; // Get input from query params
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input
  )}&key=${GOOGLE_API_KEY}&types=geocode`;

  try {
    // Make the request to Google Places API
    const response = await fetch(url);
    const data = await response.json();

    // Send the data back to the frontend
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from Google API" });
  }
};

const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id; // Ensure your auth middleware attaches user info
    if (!fcmToken) {
      return res
        .status(400)
        .json({ success: false, message: "FCM token is required" });
    }
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "FCM token updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  resetPassword,
  forgotPassword,
  googleAuthCallback,
  googleAuthFailure,
  placesApi,
  updateFCMToken,
};
