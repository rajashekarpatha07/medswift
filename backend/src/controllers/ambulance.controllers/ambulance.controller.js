import { Ambulance } from "../../models/ambulance.model.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { options } from "../../utils/auth.util.js";

/**
 * @description Register a new Ambulance
 * @route POST /api/v1/ambulance/register
 * @access Public
 */
const registerAmbulance = asyncHandler(async (req, res) => {
  const {
    drivername,
    driverPhone,
    password,
    status,
    driverlocation,
    vehicleNumber,
  } = req.body;

  if (
    !drivername ||
    !driverPhone ||
    !password ||
    !status ||
    !driverlocation?.coordinates?.length ||
    !vehicleNumber
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const existingAmbulance = await Ambulance.findOne({
    $or: [{ driverPhone }, { vehicleNumber }],
  });

  if (existingAmbulance) {
    throw new ApiError(
      400,
      "Ambulance with this phone or vehicle number already exists."
    );
  }

  const ambulance = await Ambulance.create({
    drivername,
    driverPhone,
    password,
    status,
    driverlocation,
    vehicleNumber,
  });

  if (!ambulance) {
    throw new ApiError(500, "Error creating the ambulance in the database.");
  }

  const createdAmbulance = ambulance.toObject();
  delete createdAmbulance.password;
  delete createdAmbulance.refreshToken;

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdAmbulance,
        "Ambulance registered successfully."
      )
    );
});

/**
 * @description Login a Ambulance
 * @route POST /api/v1/ambulance/login
 * @access Public
 */

const loginAmbulance = asyncHandler(async (req, res) => {
  const { driverPhone, password } = req.body;

  if (!driverPhone || !password) {
    throw new ApiError(400, "All feilds are required");
  }

  const ambulance = await Ambulance.findOne({ driverPhone });
  if (!ambulance) {
    throw new ApiError(401, "No ambulance found register first");
  }

  const isPasswordCorrect = await ambulance.checkPassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Password is incorrect try again");
  }

  const accessToken = await ambulance.getAccessToken();
  const refreshToken = await ambulance.getRefreshToken();

  ambulance.refreshToken = refreshToken;
  await ambulance.save({ validateBeforeSave: false });

  const loggedInAmbulance = ambulance.toObject();
  delete loggedInAmbulance.password;
  delete loggedInAmbulance.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        loggedInAmbulance,
        "Ambulance loggedIn successfully."
      )
    );
});

const logoutAmbulance = asyncHandler(async (req, res) => {
  await Ambulance.findByIdAndUpdate(
    req.ambulance._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Ambulance logged out successfully."));
});

/**
 * @description Update inventory for the logged-in hospital
 * @route PATCH /api/v1/hospital/inventory
 * @access Private (Hospital)
 */
const updateInventory = asyncHandler(async (req, res) => {
  const { inventory } = req.body;
  const hospitalId = req.hospital._id; // Provided by auth middleware

  if (!inventory) {
    throw new ApiError(400, "Inventory data is required.");
  }

  // Build the update object dynamically using dot notation for nested fields
  const updateFields = {};
  if (inventory.beds?.available !== undefined) {
    updateFields["inventory.beds.available"] = inventory.beds.available;
  }
  if (inventory.beds?.total !== undefined) {
    updateFields["inventory.beds.total"] = inventory.beds.total;
  }
  if (inventory.bloodStock) {
    for (const bloodType in inventory.bloodStock) {
      updateFields[`inventory.bloodStock.${bloodType}`] = inventory.bloodStock[bloodType];
    }
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No valid inventory fields to update.");
  }

  const updatedHospital = await Hospital.findByIdAndUpdate(
    hospitalId,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!updatedHospital) {
    throw new ApiError(404, "Hospital not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedHospital.inventory, "Inventory updated successfully."));
});

export { registerAmbulance, loginAmbulance, logoutAmbulance};
