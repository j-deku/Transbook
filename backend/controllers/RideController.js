import RideModel from "../models/RideModel.js";

// Helper to strip accents & lowercase
const stripAccents = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const searchRides = async (req, res) => {
  try {
    const {
      pickup, destination, selectedDate,
      passengers, sort, filter,
      page = 1, limit = 10,
      pickupLat, pickupLng, destLat, destLng,
    } = req.query;

    const query = {};

    // Geospatial fallback if coords provided
    if (pickupLat && pickupLng) {
      query.pickupLocation = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(pickupLng), parseFloat(pickupLat)],
          },
          $maxDistance: 10000, // 10 km
        },
      };
    } else if (pickup) {
      // Accent-insensitive match on normalized field
      query.pickupNorm = {
        $regex: stripAccents(pickup),
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
      query.destinationNorm = {
        $regex: stripAccents(destination),
        $options: "i",
      };
    }

    // Date filter (00:00–23:59 UTC)
    if (selectedDate) {
      const d = new Date(selectedDate);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end   = new Date(d.setHours(23, 59, 59, 999));
      query.selectedDate = { $gte: start, $lte: end };
    }

    // Minimum passengers
    if (passengers) {
      query.passengers = { $gte: Number(passengers) };
    }

    // Type filter
    if (filter && filter.toLowerCase() !== "all") {
      query.type = { $regex: `^${filter}$`, $options: "i" };
    }

    // Sorting
    const sortCriteria = {};
    if (sort === "earliest")      sortCriteria.selectedDate = 1;
    else if (sort === "lowestPrice") sortCriteria.price = 1;
    else if (sort === "shortestRide") sortCriteria.distance = 1;

    // Pagination count
    const totalCount = await RideModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / Number(limit));

    // Execute query with collation (though normalized fields make accents moot)
    const rides = await RideModel.find(query)
      .populate("driver", "name imageUrl")
      .sort(sortCriteria)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .exec();

    return res.status(200).json({ rides, totalPages });
  } catch (error) {
    console.error("Error in searchRides:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getRideCounts = async (req, res) => {
  try {
    const { pickup, destination, selectedDate, passengers } = req.query;
    const match = {};

    if (pickup)      match.pickupNorm      = { $regex: stripAccents(pickup),      $options: "i" };
    if (destination) match.destinationNorm = { $regex: stripAccents(destination), $options: "i" };
    if (selectedDate) {
      const d = new Date(selectedDate);
      match.selectedDate = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }
    if (passengers) match.passengers = { $gte: Number(passengers) };

    const counts = await RideModel.aggregate([
      { $match: match },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({ success: true, counts });
  } catch (error) {
    console.error("Error in getRideCounts:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
