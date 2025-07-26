import mongoose from "mongoose";
import {
  hashPassword,
  isPasswordMatch,
  GenerateAccessToken,
  GenerateRefreshToken
} from "../utils/auth.util.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    medicalHistory: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
UserSchema.index({
  location: "2dsphere",
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
    next();
  } else {
    return next();
  }
});
UserSchema.methods.checkPassword = async function (enteredPasword) {
  return isPasswordMatch(enteredPasword, this.password);
};
UserSchema.methods.GetAccessToken = async function () {
  return GenerateAccessToken(this.id);
};

UserSchema.methods.GetRefreshToken = function () {
  return GenerateRefreshToken(this.id);
};

export const User = mongoose.model("User", UserSchema)
