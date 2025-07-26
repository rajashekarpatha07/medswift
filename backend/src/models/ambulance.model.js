import mongoose, { Schema } from "mongoose";
import {
  hashPassword,
  isPasswordMatch,
  GenerateAccessToken,
  GenerateRefreshToken,
} from "../utils/auth.util.js";
const AmbulanceSchema = new Schema(
  {
    drivername: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    driverPhone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    status: {
      type: String,
      enum: ["ready", "on-trip", "offline"],
      default: "offline",
      required: true,
    },
    driverlocation: {
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
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);
AmbulanceSchema.index({
  driverlocation: "2dsphere",
});

AmbulanceSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
    next();
  } else {
    return next();
  }
});

AmbulanceSchema.methods.checkPassword = async function (enteredPassword) {
  return isPasswordMatch(enteredPassword, this.password);
};

AmbulanceSchema.methods.getAccessToken = function () {
  return GenerateAccessToken(this.id);
};

AmbulanceSchema.methods.getRefreshToken = function () {
  return GenerateRefreshToken(this.id);
};

export const Ambulance = mongoose.model("Ambulance", AmbulanceSchema);
