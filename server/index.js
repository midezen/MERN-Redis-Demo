import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

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
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Lists
app.post("/users/lists", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(8000, console.log("server is running"));
