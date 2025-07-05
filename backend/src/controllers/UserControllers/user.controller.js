import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/user.model.js";
import { Ambulance } from "../../models/ambulance.model.js";
import Trip from "../../models/trip.model.js";
import {
  GenerateAccessToken,
  GenerateRefreshToken,
  isPasswordMatch,
  options
} from "../../utils/auth.util.js";


export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location, bloodGroup, medicalHistory } = req.body;

  if (!name || !email || !password || !phone || !location?.coordinates?.length) {
    return res.status(400).json({
      success: false,
      message: "All fields are required including valid location",
    });
  }

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] }).lean();
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User with this email or phone already exists",
    });
  }

  const user = await User.create({ name, email, password, phone, location, bloodGroup, medicalHistory });

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) throw new ApiError(400, "Phone and password are required");

  const user = await User.findOne({ phone });
  if (!user) throw new ApiError(404, "User not found, please register first");

  const isPasswordValid = await isPasswordMatch(password, user.password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid password");

  const accessToken = GenerateAccessToken(user._id);
  const refreshToken = GenerateRefreshToken(user._id);

  try {
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, "Error saving refresh token to database");
  }

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .cookie("accessToken", accessToken, options)
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshToken: null }
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out...!"));
});

export const findNearbyAmbulances = asyncHandler(async (req, res) => {
  const { location } = req.body;

  if (
    !location ||
    location.type !== "Point" ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2
  ) {
    throw new ApiError(400, "Latitude and longitude are required");
  }

  const [lng, lat] = location.coordinates;

  let ambulances = [];
  let radius = 100;
  const maxRadius = 50000;

  while (radius <= maxRadius && ambulances.length === 0) {
    ambulances = await Ambulance.find({
      status: "ready",
      driverlocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius,
        },
      },
    });

    if (ambulances.length === 0) {
      radius += 5000;
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      ambulances,
      ambulances.length
        ? `Found ${ambulances.length} ambulances within ${radius / 1000} km`
        : "No nearby ambulances found within 50 km"
    )
  );
});

