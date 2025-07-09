import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyTokenMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

    console.log("Access Token:", token);

  if (!token) {
    throw new ApiError(401, "Unauthorized Access");
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decoded?.id || decoded?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.user = user;
  next();
});


export const verifyTokenForAmbulanceMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  console.log("Ambulance Access Token:", token);

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const ambulance = await Ambulance.findById(decoded.id || decoded._id).select(
    "-password -refreshToken"
  );

  if (!ambulance) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.ambulance = ambulance;
  next();
});
