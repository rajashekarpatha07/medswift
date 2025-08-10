import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Hospital } from "../../models/hospital.model.js";
import { options } from "../../utils/auth.util.js";

/**
 * @description Register a new hospital
 * @route POST /api/v1/hospital/register
 * @access Public
 */
const registerHospital = asyncHandler(async (req, res) => {
  const { name, email, password, address, phone, location } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !address ||
    !phone ||
    !location?.coordinates?.length
  ) {
    throw new ApiError(
      400,
      "All fields are required, including valid location coordinates."
    );
  }

  const existingHospital = await Hospital.findOne({ email });

  if (existingHospital) {
    throw new ApiError(409, "Hospital with this email already exists.");
  }

  const hospital = await Hospital.create({
    name,
    email,
    password,
    address,
    phone,
    location,
  });

  const createdHospital = hospital.toObject();
  delete createdHospital.password;
  delete createdHospital.refreshToken;

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdHospital, "Hospital registered successfully.")
    );
});

/**
 * @description Log in an existing hospital
 * @route POST /api/v1/hospital/login
 * @access Public
 */
const loginHospital = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const hospital = await Hospital.findOne({ email });

  if (!hospital) {
    throw new ApiError(404, "Hospital not found. Please register first.");
  }

  const isPasswordCorrect = await hospital.checkPassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const accessToken = hospital.getAccessToken();
  const refreshToken = hospital.getRefreshToken();

  hospital.refreshToken = refreshToken;
  await hospital.save({ validateBeforeSave: false });

  const loggedInHospital = hospital.toObject();
  delete loggedInHospital.password;
  delete loggedInHospital.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, loggedInHospital, "Hospital logged in successfully.")
    );
});

/**
 * @description Log out the current hospital
 * @route POST /api/v1/hospital/logout
 * @access Private (Hospital)
 */
// Logout Hospital
const logoutHospital = asyncHandler(async (req, res) => {
  await Hospital.findByIdAndUpdate(
    req.hospital._id,
    { $set: { refreshToken: null } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Hospital logged out successfully."));
});

// Update Inventory (Hospital can only update their own)
const updateInventory = asyncHandler(async (req, res) => {
  const { inventory } = req.body;

  if (!inventory) {
    throw new ApiError(400, "Inventory data is required.");
  }

  // Build the update object dynamically
  const updateFields = {};
  if (inventory.beds?.available !== undefined) {
    updateFields["inventory.beds.available"] = inventory.beds.available;
  }
  if (inventory.beds?.total !== undefined) {
    updateFields["inventory.beds.total"] = inventory.beds.total;
  }
  if (inventory.bloodStock) {
    for (const bloodType in inventory.bloodStock) {
      updateFields[`inventory.bloodStock.${bloodType}`] =
        inventory.bloodStock[bloodType];
    }
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No valid inventory fields to update.");
  }

  const updatedHospital = await Hospital.findByIdAndUpdate(
    req.hospital._id,
    { $set: updateFields },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!updatedHospital) {
    throw new ApiError(404, "Hospital not found.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedHospital.inventory,
      "Inventory updated successfully."
    )
  );
});

export { registerHospital, loginHospital, logoutHospital, updateInventory };
