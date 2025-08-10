import { Hospital } from "../models/hospital.model.js";

// A helper function to convert "A+" to "A_positive", etc.
const formatBloodGroupKey = (bloodGroup) => {
  return bloodGroup.replace("+", "_positive").replace("-", "_negative");
};

/**
 * Finds nearby hospitals with available beds and a specific blood type.
 * @param {object} location - The patient's location as a GeoJSON Point object.
 * @param {string} bloodGroup - The required blood group (e.g., "O-", "AB+").
 * @returns {Promise<Array>} A promise that resolves to an array of suitable hospital documents.
 */
const findNearbyHospitals = async (location, bloodGroup) => {
  console.log(
    `Searching for hospitals with available beds and blood group: ${bloodGroup}`
  );

  // 1. Convert the blood group string to the format used in our database schema
  const bloodStockKey = `inventory.bloodStock.${formatBloodGroupKey(
    bloodGroup
  )}`;

  try {
    const hospitals = await Hospital.find({
      // Filter 1: Find hospitals where available beds are greater than 0
      "inventory.beds.available": { $gt: 0 },

      // Filter 2: Find hospitals where the specific blood type stock is greater than 0
      [bloodStockKey]: { $gt: 0 },

      // Filter 3: Find them within a 50km radius, sorted by nearest
      location: {
        $nearSphere: {
          $geometry: location,
          $maxDistance: 50000, // 50km radius
        },
      },
    }).select("-password -refreshToken"); // Exclude sensitive fields

    if (hospitals.length > 0) {
      console.log(`Found ${hospitals.length} suitable hospitals.`);
    } else {
      console.log("No suitable hospitals found within the search criteria.");
    }

    return hospitals;
  } catch (error) {
    console.error("Error finding nearby hospitals:", error);
    // Propagate the error to be handled by the socket listener
    throw error;
  }
};

export {
  findNearbyHospitals
}
