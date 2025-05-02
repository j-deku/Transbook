// middlewares/cors.js
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const allowed = [ process.env.FRONTEND_URL, process.env.ADMIN_URL, process.env.DRIVER_URL ].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowed.includes(origin)) {
      console.log(`CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`CORS denied for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],           // preflight methods
  allowedHeaders: ['Content-Type','Authorization'],                  // allow your auth header
  credentials: true,                                                 // enable cookies/credentials
};
const corsMiddleware = cors(corsOptions);
export default corsMiddleware;