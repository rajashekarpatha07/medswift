import { onlineUsers, onlineAmbulances } from "../liveState.js";

const handleConnection = (socket) => {
  console.log("New Socket Connected", socket.id);

  socket.on("userConnect", ({ userId }) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }
  });

  socket.on("ambulanceConnect", ({ ambulanceId }) => {
    if (ambulanceId) {
      onlineAmbulances.set(ambulanceId, socket.id);
      console.log(
        `Ambulance ${ambulanceId} connected with socket ${socket.id}`
      );
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Clean up maps on disconnect
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        console.log(`User ${key} disconnected.`);
        break;
      }
    }
    for (let [key, value] of onlineAmbulances.entries()) {
      if (value === socket.id) {
        onlineAmbulances.delete(key);
        console.log(`Ambulance ${key} disconnected.`);
        break;
      }
    }
  });
};

export default handleConnection;
