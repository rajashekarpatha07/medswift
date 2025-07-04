import { Ambulance } from "../../models/ambulance.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { options, GenerateRefreshToken, GenerateAccessToken} from "../../utils/auth.util.js";

// @route   POST /api/ambulance/register
export const registerAmbulance = asyncHandler(async (req, res) => {
  const { drivername, driverPhone, password, driverlocation, vechileNumber } = req.body;

  if (!drivername || !driverPhone || !password || !driverlocation || !vechileNumber) {
    throw new ApiError(400, "All fields are required");
  }

  const existing = await Ambulance.findOne({ driverPhone });
  if (existing) throw new ApiError(409, "Driver already registered");

  const ambulance = await Ambulance.create({
    drivername,
    driverPhone,
    password,
    driverlocation,
    vechileNumber,
  });

  const accessToken =  GenerateAccessToken(ambulance._id);
  const refreshToken = GenerateRefreshToken(ambulance._id);

  try {
    ambulance.refreshToken = refreshToken;
    await ambulance.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, "Error saving refresh token to database"); 
  }

  const data = await Ambulance.findById(ambulance._id).select("-password -refreshToken");

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(201, data, "Ambulance registered successfully"));
});

// @route   POST /api/ambulance/login
export const loginAmbulance = asyncHandler(async (req, res) => {
  const { driverPhone, password } = req.body;

  if (!driverPhone || !password) {
    throw new ApiError(400, "Phone and password are required");
  }

  const ambulance = await Ambulance.findOne({ driverPhone });
  if (!ambulance) throw new ApiError(404, "Ambulance not found");

  const isMatch = await ambulance.checkPassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const accessToken = ambulance.getAccessToken();
  const refreshToken = GenerateRefreshToken(ambulance._id);

  try {
    ambulance.refreshToken = refreshToken;
    await ambulance.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, "Error saving refresh token to database");
  }

  const data = await Ambulance.findById(ambulance._id).select("-password -refreshToken");

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, data, "Logged in successfully"));
});

// @route   POST /api/ambulance/logout
export const logoutAmbulance = asyncHandler(async (req, res) => {
  await Ambulance.findByIdAndUpdate(req.ambulance._id, {
    $set: { refreshToken: null }
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// @route   PATCH /api/ambulance/status
export const updateAmbulanceStatus = asyncHandler(async (req, res) => {
  const ambulanceId = req.ambulance._id;
  const { status, driverlocation } = req.body;

  const validStatuses = ["ready", "on-trip", "offline"];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  if (
    !driverlocation ||
    driverlocation.type !== "Point" ||
    !Array.isArray(driverlocation.coordinates) ||
    driverlocation.coordinates.length !== 2
  ) {
    throw new ApiError(400, "Invalid driverlocation format");
  }

  const updated = await Ambulance.findByIdAndUpdate(
    ambulanceId,
    { status, driverlocation },
    { new: true, select: "-password -refreshToken" }
  );

  if (!updated) throw new ApiError(404, "Ambulance not found");

  res.status(200).json(new ApiResponse(200, updated, "Status updated successfully"));
});
