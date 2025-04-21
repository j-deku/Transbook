// middlewares/cors.js
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const corsOptions = {
  origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL, process.env.DRIVER_URL], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-HTTP-Method-Override',
    'X-HTTP-Method',
    'X-HTTP-Method-Override',
    'application/json',
    'application/javascript',
  ]
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
