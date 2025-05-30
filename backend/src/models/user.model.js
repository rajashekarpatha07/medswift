import mongoose, { Schema } from "mongoose";
import { hashpassword, isPasswordMatch, GenerateAccessToken, GenerateRefreshToken } from "../utils/auth.util.js";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
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
},{ timestamps: true });
userSchema.index({
    location: "2dsphere"
});

userSchema.pre("save", async function (next){
    if(this.isModified("password")) {
       this.password = await hashpassword(this.password);
       next();
    }else {
        return next();
    }
})

userSchema.methods.checkPassword = async function(enteredPassword) {
  return isPasswordMatch(enteredPassword, this.password);
};

userSchema.methods.getAccessToken = function () {
  return GenerateAccessToken(this.id);
};

userSchema.methods.getRefreshToken = function () {
  return GenerateRefreshToken(this.id);
};

export const User = mongoose.model("User", userSchema);