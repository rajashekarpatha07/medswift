import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { Ambulance } from "../models/ambulance.model.js";
import { connect } from "mongoose";

const UserverifyMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request: Token not found.");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );

    console.log(user);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found.");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token.");
  }
});

const AmbulanceverifyMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(400, "Invalid AccessToken");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const ambulance = await Ambulance.findById(decodedToken.id).select(
      "-password -refreshToken"
    );
    console.log(ambulance);

    if (!ambulance) {
      throw new ApiError(401, "Invalid Access Token: User not found.");
    }

    req.ambulance = ambulance;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token.");
  }
});

const refreshTokenmiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(400, "Invalid RefreshToken");
    }
    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token: User not found.");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refreshToken")
  }
});

const AmbulancerefreshTokenmiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: Refresh token is missing.");
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    
    const ambulance = await Ambulance.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );

    if (!ambulance) {
      throw new ApiError(401, "Invalid Refresh Token: Ambulance not found.");
    }

    req.ambulance = ambulance;
    next();
  } catch (error) {
    // Catch errors from jwt.verify (e.g., token expired)
    throw new ApiError(401, error?.message || "Invalid refresh token.");
  }
});

export { UserverifyMiddleware, AmbulanceverifyMiddleware, refreshTokenmiddleware, AmbulancerefreshTokenmiddleware };
