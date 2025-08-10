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

/**
 * @description Update the status of the logged-in ambulance
 * @route PATCH /api/v1/ambulance/status
 * @access Private (Ambulance)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  // This assumes you add middleware that provides req.ambulance
  const ambulanceId = req.ambulance._id;

  if (!status || !['ready', 'offline'].includes(status)) {
    throw new ApiError(400, "Invalid status provided. Must be 'ready' or 'offline'.");
  }

  const updatedAmbulance = await Ambulance.findByIdAndUpdate(
    ambulanceId,
    { $set: { status: status } },
    { new: true }
  ).select("status");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedAmbulance, "Status updated successfully."));
});


export { registerAmbulance, loginAmbulance, logoutAmbulance, updateStatus};
