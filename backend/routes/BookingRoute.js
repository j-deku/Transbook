import express from 'express'
import authMiddleware from '../middlewares/auth.js'
import { listBookings, placeBookings, updateStatus, userBookings, verifyBookings } from '../controllers/BookingController.js'

const bookRouter  = express.Router();

bookRouter.post("/place", authMiddleware,placeBookings);
bookRouter.post("/verify", verifyBookings);
bookRouter.post("/userBookings", authMiddleware,userBookings);
bookRouter.get("/list", listBookings);
bookRouter.post("/status", updateStatus);
export default bookRouter;