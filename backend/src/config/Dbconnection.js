import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(
      `\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}:${connectionInstance.connection.port}`
    );
  } catch (error) {
    console.error("Error Connecting to DB:", error);
    process.exit(1);
  }
};

export default connectDB;
