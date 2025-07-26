import handleConnection from "./handlers/connectionHandler.js";
import handleTripEvents from "./handlers/tripHandler.js";

const initializeSocketIO = (io) => {
  // This function is called for each new client that connects to the server.
  // The 'socket' object represents the individual connection to that client.
  io.on("connection", (socket) => {
    
    // Delegate handling of connection/disconnection events
    handleConnection(socket);

    // Delegate handling of all trip-related events
    handleTripEvents(socket, io);
    
  });
};

export default initializeSocketIO;
