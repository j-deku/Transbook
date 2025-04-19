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
const port = process.env.PORT || 5000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods,
    credentials: true,
    allowedHeaders: corsOptions.allowedHeaders
  },
  path: '/socket.io'      // default, but explicit helps avoid subfolder issues :contentReference[oaicite:9]{index=9}
});

// Socket.IO integration
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // When a driver joins, have them join their specific room
  socket.on("joinDriverRoom", async (driverId) => {
    socket.join(driverId);
    console.log(`Driver ${driverId} joined room.`);
  });
  // User room joining
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room.`);
  });

    // Admin room joining
    socket.on("joinAdminRoom", (adminId) => {
      socket.join(adminId);
      console.log(`Admin ${adminId} joined room.`);
    });  
    
    socket.on('driverLocationUpdate', (data) => {
      // data = { driverId, location: { lat, lng } }
      io.emit('updateDriverLocation', data); // Broadcast to all connected clients
    });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware setup
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

copyDatabase().then(console.log).catch(console.error);

// DB Connection and Super Admin setup
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
app.use("/api/protected", authMiddleware, (req, res) => {
  res.send("Hello, authenticated user!");
});

// Other middleware and logging
app.use(securityMiddleware);
app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("API working");
});
app.use((req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
});
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
