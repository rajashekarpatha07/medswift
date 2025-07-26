import connectDB from "./src/config/Dbconnection.js";
import app from "./app.js";
import { Server } from "socket.io";
import { createServer } from "http";
import initializeSocketIO from "./src/sockets/socket.js";

const PORT = process.env.PORT || 8000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "UPDATE"],
  },
});

initializeSocketIO(io);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });
