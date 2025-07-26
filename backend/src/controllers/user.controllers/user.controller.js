import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { User } from "../../models/user.model.js";
import { options } from "../../utils/auth.util.js";

/**
 * @description Register a new user
 * @route POST /api/v1/users/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, location, password, bloodGroup, medicalHistory } =
    req.body;

  if (
    !name ||
    !email ||
    !password ||
    !phone ||
    !location?.coordinates?.length
  ) {
    throw new ApiError(
      400,
      "All fields are required, including valid location coordinates."
    );
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  }).lean();

  if (existingUser) {
    throw new ApiError(
      409,
      "User with this email or phone number already exists."
    );
  }

  const user = await User.create({
    name,
    email,
    phone,
    location,
    password,
    bloodGroup,
    medicalHistory,
  });

  const createdUser = user.toObject();
  delete createdUser.password;
  delete createdUser.refreshToken;

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully."));
});

/**
 * @description Log in an existing user
 * @route POST /api/v1/users/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new ApiError(400, "Phone number and password are required.");
  }

  const user = await User.findOne({phone});

  if (!user) {
    throw new ApiError(404, "User not found. Please register first.");
  }

  const isPasswordCorrect = await user.checkPassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const accessToken = await user.GetAccessToken();
  const refreshToken = await user.GetRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = user.toObject();
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully."));
});

/**
 * @description Log out the current user
 * @route POST /api/v1/user/auth/logout
 * @access Private (Requires authentication)
 */
const logoutUser = asyncHandler(async (req, res) => {
  // The auth middleware provides req.user
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null, 
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully."));
});

export { registerUser, loginUser, logoutUser };
