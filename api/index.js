import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

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
app.use(cookieParser());
app.use(express.static("public"));

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

// Error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
