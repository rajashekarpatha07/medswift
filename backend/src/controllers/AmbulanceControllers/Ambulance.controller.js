import { Ambulance } from "../../models/ambulance.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { options } from "../../utils/auth.util.js";

export const registerAmbulance = asyncHandler(async (req, res) => {
  const { drivername, driverPhone, password, driverlocation, vechileNumber } = req.body;

  if (!drivername || !driverPhone || !password || !driverlocation || !vechileNumber) {
    throw new ApiError(400, "All fields are required");
  }

  const exist = await Ambulance.findOne({ driverPhone });
  if (exist) throw new ApiError(409, "Ambulance driver already registered");

  const ambulance = await Ambulance.create({
    drivername,
    driverPhone,
    password,
    driverlocation,
    vechileNumber,
  });
  const createdAmbulance = await Ambulance.findById(ambulance._id).select(
    "-password -refreshToken"
  );

  const accessToken = ambulance.getAccessToken();
  const refreshToken = ambulance.getRefreshToken();

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(201, createdAmbulance, "Ambulance registered successfully"));
});

export const loginAmbulance = asyncHandler(async (req, res) => {
  const { driverPhone, password } = req.body;

  if (!driverPhone || !password) {
    throw new ApiError(400, "Phone and password are required");
  }

  const ambulance = await Ambulance.findOne({ driverPhone });
  if (!ambulance) throw new ApiError(404, "Ambulance not found");

  const isMatch = await ambulance.checkPassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const loggedInAmbulance = await Ambulance.findById(ambulance._id).select(
    "-password -refreshToken"
  );

  const accessToken = ambulance.getAccessToken();
  const refreshToken = ambulance.getRefreshToken();

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInAmbulance, "Logged in successfully"));
});

export const logoutAmbulance = asyncHandler(async (req, res) => {
  await Ambulance.findByIdAndUpdate(req.ambulance._id, {
    $set: { refreshToken: null }
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Ambulance Logged Out...!"));
});