import express from 'express';
import { createRide, getRideCounts, searchRides } from '../controllers/RideController.js';
const rideRouter = express.Router();

rideRouter.get("/create", createRide);
rideRouter.get("/search", searchRides);
rideRouter.get("/rideCounts", getRideCounts);

export default rideRouter;
