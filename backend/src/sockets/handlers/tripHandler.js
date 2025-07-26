import { Ambulance } from "../../models/ambulance.model.js";
import { Trip } from "../../models/trip.model.js";
import { User } from "../../models/user.model.js";
import { onlineUsers, onlineAmbulances } from "../liveState.js";

const handleTripEvents = (socket, io) => {
  socket.on("emergencyRequestFromUser", async (data) => {
    try {
      const { userId, location } = data;
      if (!userId || !location?.coordinates) {
        return socket.emit("tripError", {
          message: "User ID and location are required.",
        });
      }

      // --- OPTIMIZATION: Find the top 5 nearest ambulances ---
      const nearestAmbulances = await Ambulance.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: location.coordinates },
            distanceField: "dist.calculated",
            maxDistance: 50000, // 50km radius
            query: { status: "ready" },
            spherical: true,
          },
        },
        { $limit: 5 }, // Get up to 5 nearby ambulances
      ]);

      if (!nearestAmbulances || nearestAmbulances.length === 0) {
        return socket.emit("tripError", {
          message: "No available ambulances found near you.",
        });
      }

      // --- OPTIMIZATION: Find the first available ONLINE ambulance ---
      let assignedAmbulance = null;
      let ambulanceSocketId = null;

      for (const ambulance of nearestAmbulances) {
        const potentialSocketId = onlineAmbulances.get(
          ambulance._id.toString()
        );
        if (potentialSocketId) {
          // Found an online ambulance!
          assignedAmbulance = ambulance;
          ambulanceSocketId = potentialSocketId;
          break; // Stop searching
        }
      }

      // If no online ambulances were found in the top 5
      if (!assignedAmbulance) {
        return socket.emit("tripError", {
          message:
            "Ambulances are nearby, but none are currently connected to the service. Please try again.",
        });
      }

      // --- Continue with trip creation ---
      const trip = await Trip.create({
        userId,
        ambulanceId: assignedAmbulance._id,
        pickupLocation: location,
        requestedAt: new Date(),
        status: "Pending",
      });

      await Ambulance.findByIdAndUpdate(assignedAmbulance._id, {
        $set: { status: "on-trip" },
      });

      const userDetails = await User.findById(userId).select(
        "name bloodGroup medicalHistory"
      );

      io.to(ambulanceSocketId).emit("newTripRequest", {
        tripId: trip._id,
        user: userDetails,
        pickupLocation: location,
      });
    } catch (error) {
      console.error("Error during emergency request:", error);
      socket.emit("tripError", { message: "A server error occurred." });
    }
  });

  socket.on("tripAcceptedByAmbulance", async ({ tripId }) => {
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: { status: "Accepted", acceptedAt: new Date() } },
      { new: true }
    );
    if (trip) {
      const userSocketId = onlineUsers.get(trip.userId.toString());
      if (userSocketId) {
        const ambulanceDetails = await Ambulance.findById(
          trip.ambulanceId
        ).select("drivername driverPhone vehicleNumber");

        io.to(userSocketId).emit("tripStatusUpdate", {
          tripId: trip._id,
          status: trip.status,
          ambulance: ambulanceDetails,
        });
      }
    }
  });

  socket.on("ambulanceEnRoute", async ({ tripId }) => {
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: { status: "En-route", enRouteAt: new Date() } },
      { new: true }
    );
    if (trip) {
      const userSocketId = onlineUsers.get(trip.userId.toString());
      if (userSocketId) {
        io.to(userSocketId).emit("tripStatusUpdate", {
          tripId: trip._id,
          status: trip.status,
        });
      }
    }
  });

  socket.on("locationUpdateFromAmbulance", async ({ tripId, coordinates }) => {
    const trip = await Trip.findById(tripId);
    if (trip && (trip.status === "Accepted" || trip.status === "En-route")) {
      const userSocketId = onlineUsers.get(trip.userId.toString());
      if (userSocketId) {
        io.to(userSocketId).emit("ambulanceLocationForUser", {
          coordinates,
        });
      }
    }
  });

  socket.on("ambulanceArrived", async ({ tripId }) => {
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: { status: "Arrived", arrivedAt: new Date() } },
      { new: true }
    );
    if (trip) {
      const userSocketId = onlineUsers.get(trip.userId.toString());
      if (userSocketId) {
        io.to(userSocketId).emit("tripStatusUpdate", {
          tripId: trip._id,
          status: trip.status,
        });
      }
    }
  });
};

export default handleTripEvents;
