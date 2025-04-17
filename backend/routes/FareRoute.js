// File: routes/FareRoute.js
import { Router } from "express";
import RideModel from "../models/RideModel.js";

const fareRouter = Router();

/**
 * POST /api/fare/update
 * Expected body: {
 *   rideId: String,
 *   newFare: Number,
 *   baseFare: Number,        // Flat starting charge
 *   ratePerMile: Number,     // Charge per kilometer (or mile)
 *   ratePerMinute: Number,   // Charge per minute estimated from ride duration
 *   surgeMultiplier: Number, // Optional surge multiplier, default is 1
 * }
 */
fareRouter.post("/update", async (req, res) => {
  try {
    const {
      rideId,
      newFare,
      baseFare,
      ratePerMile,
      ratePerMinute,
      surgeMultiplier = 1,
    } = req.body;

    // Retrieve the ride from the database
    const ride = await RideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Use the instance method to calculate the expected fare.
    const expectedFare = ride.calculateExpectedFare(baseFare, ratePerMile, ratePerMinute, surgeMultiplier);

    // Set a tolerance margin. For example, a 10% deviation from the expected fare.
    const tolerance = 0.10;
    const lowerBound = expectedFare * (1 - tolerance);
    const upperBound = expectedFare * (1 + tolerance);

    // Validate the new fare:
    if (newFare < lowerBound || newFare > upperBound) {
      return res.status(400).json({
        error: `The fare must be between ${lowerBound.toFixed(2)} and ${upperBound.toFixed(2)}.`,
      });
    }

    // Log the fare update in fareHistory for auditing purposes
    ride.fareHistory.push({
      previousFare: ride.price,
      updatedFare: newFare,
      calculatedExpectedFare: expectedFare,
      updatedAt: new Date(),
    });

    // Update the fare and save the ride document
    ride.price = newFare;
    await ride.save();

    return res.status(200).json({
      message: "Fare updated successfully",
      ride,
    });
  } catch (err) {
    console.error("Error updating fare: ", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default fareRouter;
