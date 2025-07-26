import mongoose, { Schema } from "mongoose";

const tripSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ambulanceId: {
      type: Schema.Types.ObjectId,
      ref: "Ambulance",
      required: true,
    },
    pickupLocation: {
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
    status: {
      type: String,
      enum: ["Pending", "Accepted", "En-route", "Arrived", "Cancelled"],
      default: "Pending",
    },
    escalated: {
      type: Boolean,
      default: false,
    },
    assignedByAdmin: {
      type: Boolean,
      default: false,
    },
    requestedAt: Date,
    acceptedAt: Date,
    enRouteAt: Date,
    arrivedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

tripSchema.index({ pickupLocation: "2dsphere" });

export const Trip = mongoose.model("Trip", tripSchema);
