import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyTokenforUser } from "../utils/auth.util.js";
import { verifyTokenforAmbulance } from "../utils/auth.util.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyTokenMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  const user = await verifyTokenforUser(token);
  req.user = user;
  next();
});

export const verifyTokenForAmbulanceMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  const ambulance = await verifyTokenforAmbulance(token);
  req.ambulance = ambulance;
  next();
});
