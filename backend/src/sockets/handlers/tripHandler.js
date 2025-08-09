import { Trip } from "../../models/trip.model.js";
import { Ambulance } from "../../models/ambulance.model.js";
import { findNearbyAmbulances } from "../../utils/findAmbulances.js";
import { redisClient } from "../../redis/Redisconnection.js";
import { Hospital } from "../../models/hospital.model.js";

const AMBULANCE_KEY_PREFIX = "ambulance:";
const NOTIFICATION_TIMEOUT = 30000; // 30 seconds in milliseconds

/**
 * Manages the sequential notification of drivers for a new trip.
 * @param {object} trip - The newly created trip document.
 * @param {Array} ambulances - The sorted array of nearby ambulances.
 * @param {object} io - The Socket.IO server instance.
 */
const initiateDispatch = async (trip, ambulances, io) => {
  // Loop through each driver, one by one
  for (const ambulance of ambulances) {
    // First, check if the trip has already been accepted by another driver
    const currentTrip = await Trip.findById(trip._id);
    if (currentTrip.status !== "Pending") {
      console.log(`Trip ${trip._id} is no longer pending. Stopping dispatch.`);
      return; // Exit the dispatch process
    }

    console.log(`Notifying ambulance ${ambulance._id} for trip ${trip._id}`);

    try {
      // Find the driver's socket ID from Redis
      const socketId = await redisClient.get(
        `${AMBULANCE_KEY_PREFIX}${ambulance._id}`
      );

      if (socketId) {
        // Driver is online, send them the request
        io.to(socketId).emit("newTripRequest", { trip });

        // Wait for the defined timeout period
        await new Promise((resolve) =>
          setTimeout(resolve, NOTIFICATION_TIMEOUT)
        );
      } else {
        // Driver is not online (disconnected between search and now), so we skip them
        console.log(`Ambulance ${ambulance._id} is not online. Skipping.`);
      }
    } catch (error) {
      console.error("Error during dispatch loop:", error);
    }
  }

  // After the loop, check one last time. If still pending, no one accepted.
  const finalTripStatus = await Trip.findById(trip._id);
  if (finalTripStatus.status === "Pending") {
    console.log(`No drivers accepted trip ${trip._id}. Escalating to admin.`);
    io.to("admin-room").emit("requestToAdmin", { trip: finalTripStatus });
  }
};

const handleTripEvents = (socket, io) => {
  // When a user requests an ambulance...
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

      // Join a room specific to the user, so we can easily message them later
      socket.join(data.userId.toString());

      socket.emit("tripInitiated", {
        tripId: newTrip._id,
        message: "Request received. Finding a nearby ambulance...",
      });

      const availableAmbulances = await findNearbyAmbulances(data.location);

      if (availableAmbulances.length > 0) {
        // Initiate the dispatch process
        initiateDispatch(newTrip, availableAmbulances, io);
      } else {
        socket.emit("noAmbulancesFound", {
          message:
            "We're sorry, no ambulances are available right now. We have notified our admin team.",
        });
        io.to("admin-room").emit("requestToAdmin", { trip: newTrip });
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

  /**
   * Listens for a driver accepting a trip. This is a critical, atomic operation.
   */
  socket.on("driverAcceptedTrip", async ({ tripId, ambulanceId }) => {
    console.log(`Driver ${ambulanceId} is attempting to accept trip ${tripId}`);
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

        io.to(updatedTrip.userId.toString()).emit("tripAccepted", {
          trip: updatedTrip,
        });

        socket.emit("acceptanceConfirmed", { trip: updatedTrip });
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

  socket.on("driverRequestsHospitalSearch", async (data) => {
    const { tripId, bloodGroup } = data;
    console.log(
      `Driver requests hospital search for trip ${tripId} with blood group ${bloodGroup}.`
    );

    try {
      // 1. Basic validation
      if (!tripId || !bloodGroup) {
        throw new Error(
          "Trip ID and blood group are required for hospital search."
        );
      }

      // 2. Fetch the trip details to get the patient's pickup location
      const trip = await Trip.findById(tripId);
      if (!trip) {
        throw new Error("Trip not found.");
      }

      // 3. Use our utility to find suitable hospitals
      const suitableHospitals = await findNearbyHospitals(
        trip.pickupLocation,
        bloodGroup
      );

      // 4. Send the results back to the driver who made the request
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
      // Notify the driver if an error occurs
      socket.emit("hospitalSearchError", {
        message: "An error occurred while searching for hospitals.",
      });
    }
  });

  socket.on("driverSelectedHospital", async ({ tripId, hospitalId }) => {
    console.log(
      `Driver has selected hospital ${hospitalId} for trip ${tripId}.`
    );

    try {
      // Step 1: Atomically find and reserve a bed.
      // This query finds the hospital only if a bed is available,
      // and decrements the available bed count in one atomic operation.
      const hospital = await Hospital.findOneAndUpdate(
        { _id: hospitalId, "inventory.beds.available": { $gt: 0 } },
        { $inc: { "inventory.beds.available": -1 } },
        { new: true }
      );

      if (!hospital) {
        // This means the last available bed was taken just moments before.
        console.log(
          `Failed to reserve bed at hospital ${hospitalId}. No beds available.`
        );
        socket.emit("hospitalBedUnavailable", {
          message:
            "Sorry, the last bed at this hospital was just taken. Please select another hospital.",
        });
        return;
      }

      // Step 2: If a bed was successfully reserved, update the trip document.
      const trip = await Trip.findByIdAndUpdate(
        tripId,
        { $set: { destinationHospitalId: hospitalId } },
        { new: true }
      ).populate("userId", "name phone bloodGroup medicalHistory"); // Populate user details for the alert

      if (!trip) {
        // This is unlikely but good to handle. We should ideally return the bed.
        await Hospital.findByIdAndUpdate(hospitalId, {
          $inc: { "inventory.beds.available": 1 },
        });
        throw new Error("Trip not found after reserving a bed.");
      }

      // Step 3: Send the critical alert to the hospital.
      const hospitalSocketId = await redisClient.get(`hospital:${hospitalId}`);

      if (hospitalSocketId) {
        console.log(`Sending critical patient alert to hospital ${hospitalId}`);
        io.to(hospitalSocketId).emit("criticalPatientAlert", {
          tripId: trip._id,
          patientDetails: trip.userId, // Contains name, phone, bloodGroup, medical history
          pickupLocation: trip.pickupLocation,
        });
      }

      // Step 4: Confirm the selection with the driver.
      socket.emit("hospitalSelectionConfirmed", { hospital });
    } catch (error) {
      console.error("Error during hospital selection:", error.message);
      socket.emit("hospitalSelectionError", {
        message: "An error occurred while selecting the hospital.",
      });
    }
  });

  /**
   * Listens for location updates from a driver during an active trip.
   */
  socket.on("driverLocationUpdate", async (data) => {
    try {
      const { tripId, location } = data;

      if (!tripId || !location?.coordinates) {
        return;
      }

      const trip = await Trip.findById(tripId).lean();

      if (!trip) {
        return;
      }

      const ambulance = await Ambulance.findByIdAndUpdate(
        trip.ambulanceId,
        {
          $set: { driverlocation: location },
        },
        { new: true }
      ).select("-password -refreshToken");

      // 1. Relay the location update to the user
      io.to(trip.userId.toString()).emit("ambulanceLocationUpdated", {
        tripId: trip._id,
        location: location,
      });

      // 2. (NEW LINE) Also broadcast the ambulance's full updated info to the admin room
      io.to("admin-room").emit("ambulanceStatusUpdate", ambulance);
    } catch (error) {
      console.error("Error processing driver location update:", error);
    }
  });

  /**
   * Listens for a driver marking a trip as completed.
   */
  socket.on("driverCompletedTrip", async ({ tripId }) => {
    console.log(`Driver is attempting to complete trip ${tripId}`);
    try {
      // Find the trip and update its status from 'Accepted' to 'Completed'
      const updatedTrip = await Trip.findOneAndUpdate(
        { _id: tripId, status: "Accepted" },
        {
          $set: {
            status: "Completed",
            completedAt: new Date(),
          },
        },
        { new: true }
      );

      if (updatedTrip) {
        // SUCCESS: The trip was successfully marked as completed.
        console.log(`Trip ${tripId} has been marked as completed.`);

        // 1. Make the ambulance available again by setting its status to 'ready'
        await Ambulance.findByIdAndUpdate(updatedTrip.ambulanceId, {
          $set: { status: "ready" },
        });

        // 2. Notify the user that the trip is officially over.
        io.to(updatedTrip.userId.toString()).emit("tripCompleted", {
          trip: updatedTrip,
        });

        // 3. Confirm to the driver that the server has processed the completion.
        socket.emit("completionConfirmed", {
          message: "Trip successfully completed.",
        });
      } else {
        // This can happen if the trip was not in 'Accepted' state (e.g., already completed or cancelled).
        console.log(
          `Could not complete trip ${tripId}, it was not in an 'Accepted' state.`
        );
        socket.emit("completionError", {
          message:
            "Could not complete this trip. It may have already been completed or cancelled.",
        });
      }
    } catch (error) {
      console.error("Error during trip completion:", error);
      socket.emit("completionError", {
        message: "A server error occurred while completing the trip.",
      });
    }
  });
};

export default handleTripEvents;
