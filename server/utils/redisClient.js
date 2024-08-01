import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  password: process.env.REDIS_PASSKEY,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Connect to redis
client.on("connect", () => {
  console.log("Redis connected");
});

client.on("error", (e) => {
  console.log("Redis Error", e);
});

client.connect();

export default client;
