import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import userRouter from "./routes/user.route.js";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Connected to DB"))
  .catch(console.log);

app.use("/api", userRouter);
