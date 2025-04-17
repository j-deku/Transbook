// middlewares/cors.js
import cors from 'cors';

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
