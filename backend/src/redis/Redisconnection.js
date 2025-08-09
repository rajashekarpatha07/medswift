import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

let redisClient;

const connectRedis = async () => {
  try {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL is not defined in environment variables.");
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("🔌 Connecting to Redis...");
    });

    redisClient.on("ready", () => {
      console.log("✅ Redis connected and ready to use");
    });

    await redisClient.connect();

    return redisClient; // return client if you want to use it directly
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    process.exit(1);
  }
};

export { connectRedis, redisClient };
