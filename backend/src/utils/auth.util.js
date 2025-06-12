import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Ambulance } from "../models/ambulance.model.js";
dotenv.config();

export const hashpassword = async (plainpassword) => {
    return await bcrypt.hash(plainpassword, 10)
}

export const isPasswordMatch = async (enteredPasword, HashedPassword) => {
    return await bcrypt.compare(enteredPasword, HashedPassword)
}

export const GenerateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    });
}

export const GenerateRefreshToken = (UserId) =>{
    return jwt.sign({ id: UserId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    }); 
}

export const options = {
    httpOnly: true, 
    secure: true
}

export const verifyTokenforUser = async (accessToken) => {
  try {
    if (!accessToken) {
      throw new ApiError(401, "Unauthorized Access");
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded?.id || decoded?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    return user;
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid Access Token");
  }
};

export const verifyTokenforAmbulance = async (accessToken) => {
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    const ambulance = await Ambulance.findById(decoded.id || decoded._id).select(
      "-password -refreshToken"
    );

    if (!ambulance) {
      throw new ApiError(401, "Invalid Access Token");
    }

    return ambulance;
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid Access Token");
  }
};
