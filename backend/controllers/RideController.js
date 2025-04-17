import RideModel from "../models/RideModel.js";

const createRide = async (req, res) => {
  try {
    const { pickup, destination, price, selectedDate, passengers, pickupLocation, destinationLocation } = req.body;

    const newRide = new RideModel({
      pickup,
      destination,
      price,
      selectedDate,
      passengers,
      pickupLocation,
      destinationLocation
    });

    await newRide.save(); // Distance is computed automatically here!

    res.status(201).json({ success: true, ride: newRide });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const searchRides = async (req, res) => {
  try {
    const {
      pickup,
      destination,
      selectedDate,
      passengers,
      sort,       // e.g., "earliest", "lowestPrice", "shortestRide"
      filter,     // e.g., "motorcycle", "bus", "car"
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (pickup) {
      query.pickup = { $regex: pickup, $options: "i" };
    }
    if (destination) {
      query.destination = { $regex: destination, $options: "i" };
    }
    if (selectedDate) {
      const date = new Date(selectedDate);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      query.selectedDate = { $gte: start, $lte: end };
    }
    if (passengers) {
      query.passengers = { $gte: Number(passengers) };
    }
    // Use a case-insensitive regex to filter by ride type if provided
    if (filter && filter.toLowerCase() !== "all") {
      query.type = { $regex: `^${filter}$`, $options: "i" };
    }

    let sortCriteria = {};
    if (sort === "earliest") {
      sortCriteria.selectedDate = 1;
    } else if (sort === "lowestPrice") {
      sortCriteria.price = 1;
    } else if (sort === "shortestRide") {
      sortCriteria.distance = 1;
    }

    const totalCount = await RideModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / Number(limit));

    const rides = await RideModel.find(query)
      .populate("driver", "name imageUrl")
      .sort(sortCriteria)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({ rides, totalPages });
  } catch (error) {
    console.error("Error searching rides:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getRideCounts = async (req, res) => {
  try {
    // Build a query from optional filters (if needed)
    const { pickup, destination, selectedDate, passengers } = req.query;
    let query = {};

    if (pickup) {
      query.pickup = { $regex: pickup, $options: "i" };
    }
    if (destination) {
      query.destination = { $regex: destination, $options: "i" };
    }
    if (selectedDate) {
      const date = new Date(selectedDate);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      query.selectedDate = { $gte: start, $lte: end };
    }
    if (passengers) {
      query.passengers = { $gte: Number(passengers) };
    }
    
    // Aggregate counts by ride type.
    const counts = await RideModel.aggregate([
      { $match: query },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    return res.status(200).json({ success: true, counts });
  } catch (error) {
    console.error("Error fetching ride counts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



export { createRide, searchRides, getRideCounts};
