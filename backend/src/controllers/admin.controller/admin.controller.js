import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Ambulance } from "../../models/ambulance.model.js";
import { Trip } from "../../models/trip.model.js";

/**
 * @description Get all ambulances for the admin dashboard
 * @route GET /api/v1/admin/ambulances
 * @access Private (Admin)
 */
const getAllAmbulances = asyncHandler(async (req, res) => {
  const ambulances = await Ambulance.find({}).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, ambulances, "Ambulances fetched successfully."));
});

/**
 * @description Get all trips for the admin dashboard
 * @route GET /api/v1/admin/trips
 * @access Private (Admin)
 */
const getAllTrips = asyncHandler(async (req, res) => {
  // Fetch all trip documents from the database
  const trips = await Trip.find({})
    // Populate with user's name and phone
    .populate("userId", "name phone")
    // Populate with ambulance driver's name and vehicle number
    .populate("ambulanceId", "drivername vehicleNumber")
    // Sort by most recent trips first
    .sort({ createdAt: -1 });

  // Return the list of trips
  return res
    .status(200)
    .json(new ApiResponse(200, trips, "Trips fetched successfully."));
});


// 2. Export the new function
export { getAllAmbulances, getAllTrips };