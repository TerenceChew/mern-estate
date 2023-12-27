import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";

const app = express();

// Set up port
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

// Connect to DB
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Connected to DB"))
  .catch(console.log);

// Middlewares
app.use(express.json());

// Routes
app.use("/api", userRouter);
app.use("/api", authRouter);
