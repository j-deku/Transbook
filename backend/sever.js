// sever.js
import express from "express";
import corsMiddleware, { corsOptions } from "./middlewares/cors.js";
import userRouter from "./routes/UserRoute.js";
import limiter from "./middlewares/rateLimiter.js";
import "dotenv/config.js";
import cartRouter from "./routes/CartRoute.js";
import bookRouter from "./routes/BookingRoute.js";
import authMiddleware from "./middlewares/auth.js";
import securityMiddleware from "./middlewares/security.js";
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import permissionRouter from "./routes/PermissionRoute.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import "./config/passport.js";
import passport from "./config/passport.js";
import BotRouter from "./routes/BotRoute.js";
import adminRouter from "./routes/AdminRoute.js";
import driverRouter from "./routes/DriverRoute.js";
import rideRouter from "./routes/RideRoute.js";
import http from "http";
import { Server } from "socket.io";
import { ensureSuperAdminExists } from "./controllers/AdminController.js";
import notificationRouter from "./routes/NotificationRoute.js";
import { connectDB } from "./config/Db.js";
import fareRouter from "./routes/FareRoute.js";
import copyDatabase from "./utils/copyDatabase.js";

// App configuration
const app = express();
const port = process.env.PORT || 80;

// Trust Render's proxy for correct protocol and upgrade handling
app.set("trust proxy", 1);

// Global CORS setup (must come before any routes)
app.use(corsMiddleware);
app.options("*", corsMiddleware);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie and session setup
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

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Database copy and connection
copyDatabase()
  .then(() => console.log("Database copy completed"))
  .catch(console.error);

connectDB().then(() => {
  ensureSuperAdminExists();
});

// Rate limiter middleware
app.use(limiter);

// Mount API endpoints
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
  (req, res) => {
    res.send("Hello, authenticated user!");
  }
);

// Security and error handling
app.use(securityMiddleware);
app.use(errorHandler);

// Logger for unmatched routes
app.get("/", (req, res) => {
  res.send("API working");
});
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: corsOptions.credentials,
    allowedHeaders: corsOptions.allowedHeaders,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io",
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
});

// Socket.IO integration
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

// Start the server
server.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
