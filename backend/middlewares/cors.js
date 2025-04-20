// middlewares/cors.js
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const corsOptions = {
  origin: [
    'https://toli-toli.onrender.com',
    'https://toli-toli-admin.onrender.com',
    'https://toli-toli-driver.onrender.com',
  ].filter(Boolean),           // drop any undefined entries
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials',
  ],
  optionsSuccessStatus: 204,   // some legacy browsers choke on 204
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
