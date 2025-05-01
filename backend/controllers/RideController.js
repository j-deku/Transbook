import RideModel from "../models/RideModel.js";

// Utility: strip accents via Unicode normalization
const normalizeText = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const searchRides = async (req, res) => {
  try {
    const {
      pickup,
      destination,
      selectedDate,
      passengers,
      sort,
      filter,
      page = 1,
      limit = 10,
      pickupLat,
      pickupLng,
      destLat,
      destLng,
    } = req.query;

    // Build query object
    let query = {};

    // 1) Geospatial lookup if coords provided (fallback)
    if (pickupLat && pickupLng) {
      query.pickupLocation = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(pickupLng), parseFloat(pickupLat)],
          },
          $maxDistance: 10000,  // within 10 km
        },
      };
    } else if (pickup) {
      // 2) Accent-/case-insensitive text match
      query.pickup = {
        $regex: normalizeText(pickup),
        $options: "i",
      };
    }

    if (destLat && destLng) {
      query.destinationLocation = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(destLng), parseFloat(destLat)],
          },
          $maxDistance: 10000,
        },
      };
    } else if (destination) {
      query.destination = {
        $regex: normalizeText(destination),
        $options: "i",
      };
    }

    // 3) Date filter (midnight-to-midnight)
    if (selectedDate) {
      const d = new Date(selectedDate);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end   = new Date(d.setHours(23, 59, 59, 999));
      query.selectedDate = { $gte: start, $lte: end };
    }

    // 4) Passenger count minimum
    if (passengers) {
      query.passengers = { $gte: Number(passengers) };
    }

    // 5) Ride-type filter
    if (filter && filter.toLowerCase() !== "all") {
      query.type = { $regex: `^${filter}$`, $options: "i" };
    }

    // 6) Sorting criteria
    let sortCriteria = {};
    if (sort === "earliest") sortCriteria.selectedDate = 1;
    else if (sort === "lowestPrice") sortCriteria.price = 1;
    else if (sort === "shortestRide") sortCriteria.distance = 1;

    // Count total for pagination
    const totalCount = await RideModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / Number(limit));

    // Execute query with collation for accent-/case-insensitivity
    const rides = await RideModel.find(query)
      .populate("driver", "name imageUrl")
      .sort(sortCriteria)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .collation({ locale: "en", strength: 1 })
      .exec();

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



export { searchRides, getRideCounts};
