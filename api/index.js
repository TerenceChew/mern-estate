import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import cookieParser from "cookie-parser";
import path from "path";
import compression from "compression";

const app = express();
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(compression({ level: 6 }));
app.use("/api/static", express.static("api/public"));
app.use(express.static("client/dist"));

// Set up port
const PORT = process.env.PORT || 3000;

// Connect to DB
mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => {
    console.log("Connected to DB");

    // Routes
    app.use("/api/user", userRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/listing", listingRouter);

    // Route to serve client
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "client/dist/index.html"));
    });

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

    app.listen(PORT, () => {
      console.log(`Running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
  });
