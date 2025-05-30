import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/user.model.js";
import {
  GenerateAccessToken,GenerateRefreshToken,
  isPasswordMatch, options
} from "../../utils/auth.util.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      throw new ApiError(400, "User with this email or phone already exists");
    }

    // Create user
    const user = await User.create({ name, email, password, phone, location });

    // Fetch created user without sensitive fields
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while creating the user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      errors: err.errors || [],
      data: null,
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new ApiError(400, "Phone and password are required");
  }

  const user = await User.findOne({ phone });
  if (!user) {
    throw new ApiError(404, "User not found, please register first");
  }

  const isPasswordValid = await isPasswordMatch(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const accessToken = GenerateAccessToken(user._id);
  const refreshToken = GenerateRefreshToken(user._id);

  // Save refreshToken in DB
  try {
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, "Error saving refresh token to database"); 
  }

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
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
    .json(new ApiResponse(200, {}, "User Logged Out...!"));
});


export { registerUser, loginUser, logoutUser };
