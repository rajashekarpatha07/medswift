import { Trip } from "../../models/trip.model.js";
import { Ambulance } from "../../models/ambulance.model.js";
import { findNearbyAmbulances } from "../../utils/findAmbulances.js";
import { redisClient } from "../../redis/Redisconnection.js";
import { Hospital } from "../../models/hospital.model.js";
import { findNearbyHospitals } from "../../utils/findHospitals.js";

const AMBULANCE_KEY_PREFIX = "ambulance:";
const NOTIFICATION_TIMEOUT = 30000; // 30 seconds in milliseconds

const initiateDispatch = async (trip, ambulances, io) => {
  for (const ambulance of ambulances) {
    const currentTrip = await Trip.findById(trip._id);
    if (currentTrip.status !== "Pending") {
      console.log(`Trip ${trip._id} is no longer pending. Stopping dispatch.`);
      return;
    }
    console.log(`Notifying ambulance ${ambulance._id} for trip ${trip._id}`);
    try {
      const socketId = await redisClient.get(
        `${AMBULANCE_KEY_PREFIX}${ambulance._id}`
      );
      if (socketId) {
        io.to(socketId).emit("newTripRequest", { trip });
        await new Promise((resolve) =>
          setTimeout(resolve, NOTIFICATION_TIMEOUT)
        );
      } else {
        console.log(`Ambulance ${ambulance._id} is not online. Skipping.`);
      }
    } catch (error) {
      console.error("Error during dispatch loop:", error);
    }
  }
  const finalTripStatus = await Trip.findById(trip._id);
  if (finalTripStatus.status === "Pending") {
    const populatedTripForAdmin = await Trip.findById(
      finalTripStatus._id
    ).populate("userId", "name phone");
    console.log(`No drivers accepted trip ${trip._id}. Escalating to admin.`);
    io.to("admin-room").emit("requestToAdmin", { trip: populatedTripForAdmin });
  }
};

const handleTripEvents = (socket, io) => {
  socket.on("emergencyRequestFromUser", async (data) => {
    try {
      if (!data.userId || !data.location?.coordinates)
        throw new Error("Invalid request data.");
      const newTrip = await Trip.create({
        userId: data.userId,
        pickupLocation: data.location,
        requestedAt: new Date(),
        status: "Pending",
      });
      socket.join(data.userId.toString());
      socket.emit("tripInitiated", {
        tripId: newTrip._id,
        message: "Request received. Finding a nearby ambulance...",
      });
      const availableAmbulances = await findNearbyAmbulances(data.location);
      if (availableAmbulances.length > 0) {
        initiateDispatch(newTrip, availableAmbulances, io);
      } else {
        socket.emit("noAmbulancesFound", {
          message:
            "We're sorry, no ambulances are available right now. We have notified our admin team.",
        });
        const populatedTripForAdmin = await Trip.findById(newTrip._id).populate(
          "userId",
          "name phone"
        );
        io.to("admin-room").emit("requestToAdmin", {
          trip: populatedTripForAdmin,
        });
      }
    } catch (error) {
      console.error(
        "An error occurred during emergency request handling:",
        error.message
      );
      socket.emit("tripError", {
        message:
          "A system error occurred. Please try again or call emergency services directly.",
      });
    }
  });

  socket.on("adminNotifiesUser", ({ userId, message }) => {
    console.log(`Admin is sending a message to user ${userId}: "${message}"`);
    io.to(userId.toString()).emit("adminMessage", { message });
  });

  socket.on("driverAcceptedTrip", async ({ tripId, ambulanceId }) => {
    try {
      const updatedTrip = await Trip.findOneAndUpdate(
        { _id: tripId, status: "Pending" },
        {
          $set: {
            status: "Accepted",
            ambulanceId: ambulanceId,
            acceptedAt: new Date(),
          },
        },
        { new: true }
      );
      if (updatedTrip) {
        console.log(
          `Trip ${tripId} successfully accepted by ambulance ${ambulanceId}.`
        );
        await Ambulance.findByIdAndUpdate(ambulanceId, {
          $set: { status: "on-trip" },
        });
        const populatedTrip = await Trip.findById(updatedTrip._id)
          .populate("userId", "name phone bloodGroup medicalHistory")
          .populate(
            "ambulanceId",
            "drivername driverPhone vehicleNumber driverlocation"
          );
        io.to(populatedTrip.userId._id.toString()).emit("tripAccepted", {
          trip: populatedTrip,
        });
        socket.emit("acceptanceConfirmed", { trip: populatedTrip });
      } else {
        console.log(
          `Ambulance ${ambulanceId} failed to accept trip ${tripId} (already taken).`
        );
        socket.emit("tripAlreadyTaken", {
          message: "This trip has already been assigned to another driver.",
        });
      }
    } catch (error) {
      console.error(`Error during trip acceptance:`, error);
      socket.emit("tripError", {
        message: "An error occurred while trying to accept the trip.",
      });
    }
  });

  socket.on("driverArrived", async ({ tripId }) => {
    try {
      const updatedTrip = await Trip.findOneAndUpdate(
        { _id: tripId, status: "Accepted" },
        { $set: { status: "Arrived", arrivedAt: new Date() } },
        { new: true }
      ).populate("userId", "name phone");
      if (updatedTrip) {
        console.log(`Driver has arrived for trip ${tripId}.`);
        io.to(updatedTrip.userId._id.toString()).emit("tripStatusUpdate", {
          trip: updatedTrip,
        });
        socket.emit("tripStatusUpdate", { trip: updatedTrip });
      }
    } catch (error) {
      console.error(`Error updating trip status to Arrived:`, error);
    }
  });

  socket.on("driverRequestsHospitalSearch", async (data) => {
    const { tripId, bloodGroup } = data;
    try {
      if (!tripId || !bloodGroup)
        throw new Error(
          "Trip ID and blood group are required for hospital search."
        );
      const trip = await Trip.findById(tripId);
      if (!trip) throw new Error("Trip not found.");
      const suitableHospitals = await findNearbyHospitals(
        trip.pickupLocation,
        bloodGroup
      );
      if (suitableHospitals.length > 0) {
        socket.emit("hospitalSearchResults", { hospitals: suitableHospitals });
      } else {
        socket.emit("noHospitalsFound", {
          message:
            "No suitable hospitals with available beds and required blood type were found nearby.",
        });
      }
    } catch (error) {
      console.error("Error during hospital search:", error.message);
      socket.emit("hospitalSearchError", {
        message: "An error occurred while searching for hospitals.",
      });
    }
  });

  socket.on("driverSelectedHospital", async ({ tripId, hospitalId }) => {
    try {
      const hospital = await Hospital.findOneAndUpdate(
        { _id: hospitalId, "inventory.beds.available": { $gt: 0 } },
        { $inc: { "inventory.beds.available": -1 } },
        { new: true }
      );
      if (!hospital) {
        console.log(
          `Failed to reserve bed at hospital ${hospitalId}. No beds available.`
        );
        socket.emit("hospitalBedUnavailable", {
          message:
            "Sorry, the last bed at this hospital was just taken. Please select another hospital.",
        });
        return;
      }
      const trip = await Trip.findByIdAndUpdate(
        tripId,
        { $set: { destinationHospitalId: hospitalId } },
        { new: true }
      ).populate("userId", "name phone bloodGroup medicalHistory");
      if (!trip) {
        await Hospital.findByIdAndUpdate(hospitalId, {
          $inc: { "inventory.beds.available": 1 },
        });
        throw new Error("Trip not found after reserving a bed.");
      }
      const hospitalSocketId = await redisClient.get(`hospital:${hospitalId}`);
      if (hospitalSocketId) {
        console.log(`Sending critical patient alert to hospital ${hospitalId}`);
        io.to(hospitalSocketId).emit("criticalPatientAlert", {
          tripId: trip._id,
          patientDetails: trip.userId,
          pickupLocation: trip.pickupLocation,
        });
      }
      socket.emit("hospitalSelectionConfirmed", { hospital });
    } catch (error) {
      console.error("Error during hospital selection:", error.message);
      socket.emit("hospitalSelectionError", {
        message: "An error occurred while selecting the hospital.",
      });
    }
  });

  socket.on("driverLocationUpdate", async (data) => {
    try {
      const { tripId, location } = data;
      if (!tripId || !location?.coordinates) return;
      const trip = await Trip.findById(tripId).lean();
      if (!trip) return;
      const ambulance = await Ambulance.findByIdAndUpdate(
        trip.ambulanceId,
        { $set: { driverlocation: location } },
        { new: true }
      ).select("-password -refreshToken");
      io.to(trip.userId.toString()).emit("ambulanceLocationUpdated", {
        tripId: trip._id,
        location: location,
      });
      io.to("admin-room").emit("ambulanceStatusUpdate", ambulance);
    } catch (error) {
      console.error("Error processing driver location update:", error);
    }
  });

  socket.on("driverCompletedTrip", async ({ tripId }) => {
    try {
      const updatedTrip = await Trip.findOneAndUpdate(
        { _id: tripId, status: { $in: ["Accepted", "Arrived"] } },
        { $set: { status: "Completed", completedAt: new Date() } },
        { new: true }
      );
      if (updatedTrip) {
        console.log(`Trip ${tripId} has been marked as completed.`);
        await Ambulance.findByIdAndUpdate(updatedTrip.ambulanceId, {
          $set: { status: "ready" },
        });
        io.to(updatedTrip.userId.toString()).emit("tripCompleted", {
          trip: updatedTrip,
        });
        socket.emit("completionConfirmed", {
          message: "Trip successfully completed.",
        });
      } else {
        console.log(
          `Could not complete trip ${tripId}, it was not in a valid state.`
        );
        socket.emit("completionError", {
          message: "Could not complete this trip.",
        });
      }
    } catch (error) {
      console.error("Error during trip completion:", error);
    }
  });
};

export default handleTripEvents;
