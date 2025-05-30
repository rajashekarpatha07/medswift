import { asyncHandler } from "../utils/AsyncHandler.js";
import { verifyToken } from "../utils/auth.util.js";

export const verifyTokenMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  const user = await verifyToken(token);
  req.user = user;
  next();
});
