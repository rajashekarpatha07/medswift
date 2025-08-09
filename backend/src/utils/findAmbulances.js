import { Ambulance } from "../models/ambulance.model.js";

// An array of radii in meters.
// 5,000m = 5km, 10,000m = 10km, and so on.
const RADIUS_LEVELS_IN_METERS = [
  5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000,
];

/**
 * Finds available ambulances in progressively larger radii.
 * @param {object} location - The user's location as a GeoJSON Point object.
 * @returns {Promise<Array>} A promise that resolves to an array of full ambulance documents, or an empty array if none are found.
 */
export const findNearbyAmbulances = async (location) => {
  console.log("Searching for nearby ambulances...");

  for (const radius of RADIUS_LEVELS_IN_METERS) {
    try {
      const ambulances = await Ambulance.find({
        // Filter 1: Find ambulances whose status is 'ready'
        status: "ready",

        // Filter 2: Find them within the specified geographic radius
        driverlocation: {
          $nearSphere: {
            $geometry: location,
            $maxDistance: radius, // maxDistance is in meters
          },
        },
      });

      // If we find any ambulances in the current radius, return them immediately.
      // The $nearSphere operator automatically sorts them from nearest to farthest.
      if (ambulances.length > 0) {
        console.log(
          `Found ${ambulances.length} ambulances within ${radius / 1000}km.`
        );
        return ambulances;
      }
    } catch (error) {
      console.error(
        `Error finding ambulances within ${radius / 1000}km radius:`,
        error
      );
      // We throw the error so the calling function in tripHandler can catch it
      // and notify the user of a system error.
      throw error;
    }
  }

  // If the loop completes without finding any ambulances, return an empty array.
  console.log("No available ambulances found within the maximum 50km radius.");
  return [];
};
