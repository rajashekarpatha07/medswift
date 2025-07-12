import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifySocketUser = async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers?.cookie;
    if (!cookieHeader) {
      return next(new Error("Unauthorized: No cookies sent"));
    }

    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, val.join("=")];
      })
    );

    const token = cookies.accessToken;
    if (!token) {
      return next(new Error("Unauthorized: Token missing in cookies"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return next(new Error("Unauthorized: User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error("❌ Socket auth error:", err.message);
    return next(new Error("Unauthorized: Token invalid or expired"));
  }
};
