import BookingModel from "../models/BookingModel.js";
import userModel from '../models/UserModel.js';
import RideModel from '../models/RideModel.js'
import Paystack from 'paystack-api'
import { io } from "../sever.js"; // Import socket.io instance

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY)


//placing user order for frontend 
const placeBookings = async (req, res) => {
    const frontend_url ="http://localhost:5173";
  
    if (!req.body.userId || !req.body.rides || !req.body.amount || !req.body.address) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
  
    try {
      const newBooking = new BookingModel({
        userId: req.body.userId,
        rides: req.body.rides,
        amount: req.body.amount,
        address: req.body.address,
        email: req.body.email,
      });
      await newBooking.save();
      await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
  
      const line_items = req.body.rides.map((ride) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: ride.name,
          },
          unit_amount: ride.price * 100,
        },
        quantity: ride.quantity,
      }));
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery charges",
          },
          unit_amount: 2 * 100,
        },
        quantity: 1,
      });
  
      const paymentData = {
        line_items: line_items,
        email:req.body.email,
        mode: "payment",
        amount:req.body.amount * 100,
        callback_url: `${frontend_url}/verify?success=true&bookingId=${newBooking._id}`,
        cancel_url: `${frontend_url}/verify?success=false&bookingId=${newBooking._id}`,
      }

      const response = await paystack.transaction.initialize(paymentData);
      if(response.status){
        res.json({ success: true,authorization_url:response.data.authorization_url });
      }else{
        res.status(500).json({success:false,message:"Error initializing payment"});
      }1
    } catch (error) {
      console.error("Paystack initializing creation error:", error);
      res.status(500).json({ success: false, message: "Error creating Paystack transaction", error: error.message });
    }
  };
  
  const verifyBookings = async (req, res) => {
    const { bookingId, success } = req.body;
    try {
      if (success === "true") {
        // Update booking payment status
        const booking = await BookingModel.findByIdAndUpdate(
          bookingId,
          { payment: true },
          { new: true }
        ).populate("rides");
  
        if (booking && booking.rides && booking.rides.length > 0) {
          for (const ride of booking.rides) {
            // Update ride status to "pending approval" if not already updated
            if (ride.status !== "approved" && ride.status !== "declined") {
              await RideModel.findByIdAndUpdate(ride._id, { status: "pending approval" });
              // Emit a ride request event to the assigned driver's room
              if (ride.driver) {
                io.to(ride.driver.toString()).emit("rideRequest", { ride });
                console.log(`Emitted rideRequest event to driver ${ride.driver}`);
              }
            }
          }
        }
        return res.status(200).json({ success: true, message: "Payment successful and ride(s) assigned", booking });
      } else {
        await BookingModel.findByIdAndDelete(bookingId);
        return res.status(200).json({ success: false, message: "Payment failed" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      return res.status(500).json({ success: false, message: "Error verifying payment" });
    }
  };
  
//user bookings for frontend
const userBookings = async(req,res) =>{
try {
    const bookings = await BookingModel.find({userId:req.body.userId});
    res.json({success:true,data:bookings})
} catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"});
}
}

//Listing bookings for admin panel
const listBookings = async(req,res) =>{
    try {
        const bookings = await BookingModel.find({});
        res.json({success:true,data:bookings});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

//api for updating bookings status
const updateStatus = async (req,res) =>{
    try {
        await BookingModel.findByIdAndUpdate(req.body.bookingId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}


export {placeBookings,verifyBookings,userBookings,listBookings,updateStatus}
