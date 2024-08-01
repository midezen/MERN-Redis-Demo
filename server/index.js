import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import redisClient from "./utils/redisClient.js";

dotenv.config();
const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(cors());

// DB connection
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("DB connected"))
  .catch((e) => console.log(e));

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
  },
  { timestamps: true }
);

// User Model
const User = mongoose.model("User", userSchema);

// Create User
app.post("/users/create", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    // Invalidate after created a new user.
    await redisClient.del("allUsers");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Lists
app.get("/users/lists", async (req, res) => {
  try {
    //check cache
    const cacheKey = "allUsers";
    const cachedUsers = await redisClient.get(cacheKey);
    if (cachedUsers) {
      console.log("Cache hit - Users fetched from Redis");
      return res.status(200).json({ users: JSON.parse(cachedUsers) });
    }
    const users = await User.find();
    // Save into Cache for first request
    if (users.length) {
      await redisClient.set(cacheKey, JSON.stringify(users), "EX", 3600); //cache for 1hr
      console.log("Cache miss - Users fetched from mongodb");
      res.status(200).json(users);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(8000, console.log("server is running"));
