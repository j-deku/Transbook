// middlewares/cors.js
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.DRIVER_URL,
];

// Filter out undefined or empty URLs
const filteredOrigins = allowedOrigins.filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (filteredOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(
        new Error(`Not allowed by CORS: origin ${origin}`),
        false
      );
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'], // Optional
  optionsSuccessStatus: 200,
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
