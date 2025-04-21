// sever.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

import corsMiddleware from "./middlewares/cors.js";
import userRouter from "./routes/UserRoute.js";
import cartRouter from "./routes/CartRoute.js";
import bookRouter from "./routes/BookingRoute.js";
import permissionRouter from "./routes/PermissionRoute.js";
import adminRouter from "./routes/AdminRoute.js";
import driverRouter from "./routes/DriverRoute.js";
import rideRouter from "./routes/RideRoute.js";
import fareRouter from "./routes/FareRoute.js";
import notificationRouter from "./routes/NotificationRoute.js";
import BotRouter from "./routes/BotRoute.js";

import limiter from "./middlewares/rateLimiter.js";
import authMiddleware from "./middlewares/auth.js";
import securityMiddleware from "./middlewares/security.js";
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";

import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport.js";

import { connectDB } from "./config/Db.js";
import { ensureSuperAdminExists } from "./controllers/AdminController.js";
import copyDatabase from "./utils/copyDatabase.js";

import "dotenv/config.js";

// ── ESM __dirname Derivation ───────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── App & Server Setup ─────────────────────────────────────────────────────────
const app = express();
const port = process.env.PORT || 80;

// Create HTTP server & attach Socket.IO
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
  path: "/socket.io",
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
});

// ── 1) Serve Vite Build Output ─────────────────────────────────────────────────
app.use(
  express.static(path.join(__dirname, "dist"), {
    setHeaders(res, filePath) {
      if (filePath.endsWith(".js") || filePath.endsWith(".jsx") || filePath.endsWith(".mjs")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// ── 2) Core Middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);
app.options("*", corsMiddleware);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(limiter);

// ── 3) API Route Mounts ─────────────────────────────────────────────────────────
app.use("/api/user", userRouter);
app.use("/api/rides", rideRouter);
app.use("/api/cart", cartRouter);
app.use("/api/booking", bookRouter);
app.use("/api/permission", permissionRouter);
app.use("/api/admin", adminRouter);
app.use("/api/driver", driverRouter);
app.use("/api/fare", fareRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/placeApi", userRouter);
app.use("/api/auth", userRouter);
app.use("/api/chat", BotRouter);
app.use(
  "/api/protected",
  authMiddleware,
  (req, res) => res.send("Hello, authenticated user!")
);

// ── 4) SPA Fallback (after API & static) ────────────────────────────────────────
app.get("*", (req, res, next) => {
  // Skip API and static asset requests
  if (
    req.path.startsWith("/api/") ||
    req.path.startsWith("/assets/") ||
    !req.accepts("html")
  ) {
    return next();
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ── 5) Additional Middleware & Error Handling ───────────────────────────────────
app.use(securityMiddleware);
app.use(errorHandler);
app.use((req, res) => {
  logger.info(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Endpoint not found" });
});

// ── 6) Socket.IO Integration ───────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinDriverRoom", (driverId) => {
    socket.join(driverId);
    console.log(`Driver ${driverId} joined room.`);
  });
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room.`);
  });
  socket.on("joinAdminRoom", (adminId) => {
    socket.join(adminId);
    console.log(`Admin ${adminId} joined room.`);
  });
  socket.on("driverLocationUpdate", (data) => {
    io.emit("updateDriverLocation", data);
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ── 7) Database & Super‑Admin Setup ─────────────────────────────────────────────
copyDatabase().catch(console.error);
connectDB().then(() => ensureSuperAdminExists());

// ── Start Server ───────────────────────────────────────────────────────────────
server.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
