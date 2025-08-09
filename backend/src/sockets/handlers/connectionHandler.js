import { redisClient } from "../../redis/Redisconnection.js";

const USER_KEY_PREFIX = "user:";
const AMBULANCE_KEY_PREFIX = "ambulance:";
const HOSPITAL_KEY_PREFIX = "hospital:"; 

const handleConnection = (socket) => {
  console.log("New Socket Connected", socket.id);

  socket.on("adminConnect", () => {
    console.log(
      `Admin connected with socket ${socket.id}, joining admin room.`
    );
    socket.join("admin-room");
  });

  // Store user socket
  socket.on("userConnect", async ({ userId }) => {
    if (userId) {
      try {
        socket.userId = userId;
        socket.role = "user";
        await redisClient.set(`${USER_KEY_PREFIX}${userId}`, socket.id);
        console.log(`✅ User ${userId} connected with socket ${socket.id}`);
      } catch (err) {
        console.error(`❌ Error storing user ${userId} in Redis:`, err);
      }
    }
  });

  // Store ambulance socket
  socket.on("ambulanceConnect", async ({ ambulanceId }) => {
    if (ambulanceId) {
      try {
        socket.ambulanceId = ambulanceId;
        socket.role = "ambulance";
        await redisClient.set(
          `${AMBULANCE_KEY_PREFIX}${ambulanceId}`,
          socket.id
        );
        console.log(
          `🚑 Ambulance ${ambulanceId} connected with socket ${socket.id}`
        );
      } catch (err) {
        console.error(
          `❌ Error storing ambulance ${ambulanceId} in Redis:`,
          err
        );
      }
    }
  });

  // Store hospital socket
  socket.on("hospitalConnect", async ({ hospitalId }) => {
    if (hospitalId) {
      try {
        socket.hospitalId = hospitalId;
        socket.role = "hospital";
        await redisClient.set(`${HOSPITAL_KEY_PREFIX}${hospitalId}`, socket.id);
        console.log(
          `🏥 Hospital ${hospitalId} connected with socket ${socket.id}`
        );
      } catch (err) {
        console.error(`❌ Error storing hospital ${hospitalId} in Redis:`, err);
      }
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
    try {
      if (socket.role === "user" && socket.userId) {
        await redisClient.del(`${USER_KEY_PREFIX}${socket.userId}`);
        console.log(`User ${socket.userId} disconnected and removed.`);
      } else if (socket.role === "ambulance" && socket.ambulanceId) {
        await redisClient.del(`${AMBULANCE_KEY_PREFIX}${socket.ambulanceId}`);
        console.log(
          `Ambulance ${socket.ambulanceId} disconnected and removed.`
        );
      } else if (socket.role === "hospital" && socket.hospitalId) {
        await redisClient.del(`${HOSPITAL_KEY_PREFIX}${socket.hospitalId}`);
        console.log(`Hospital ${socket.hospitalId} disconnected and removed.`);
      }
    } catch (err) {
      console.error("❌ Error cleaning up Redis on disconnect:", err);
    }
  });
};

export default handleConnection;
