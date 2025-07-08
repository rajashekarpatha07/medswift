import mongoose, { Schema } from "mongoose";
import {
  hashpassword,
  isPasswordMatch,
  GenerateAccessToken,
  GenerateRefreshToken,
} from "../utils/auth.util.js";
const ambulanceSchema = new Schema(
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
    refreshToken:{
      type: String,
      default: null,
    }
  },
  { timestamps: true }
);
ambulanceSchema.index({
  driverlocation: "2dsphere",
});

ambulanceSchema.pre("save", async function (next){
    if(this.isModified("password")) {
       this.password = await hashpassword(this.password);
       next();
    }else {
        return next();
    }
})

ambulanceSchema.methods.checkPassword = async function(enteredPassword) {
  return isPasswordMatch(enteredPassword, this.password);
};

ambulanceSchema.methods.getAccessToken = function () {
  return GenerateAccessToken(this.id);
};

ambulanceSchema.methods.getRefreshToken = function () {
  return GenerateRefreshToken(this.id);
};

export const Ambulance = mongoose.model("Ambulance", ambulanceSchema);
