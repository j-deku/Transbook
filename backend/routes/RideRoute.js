import express from 'express';
import { getRideCounts, searchRides } from '../controllers/RideController.js';
const rideRouter = express.Router();

rideRouter.get("/search", searchRides);
rideRouter.get("/rideCounts", getRideCounts);

export default rideRouter;
