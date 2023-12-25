import express from "express";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

mongoose
  .connect(process.env.DATABASE_URI)
  .then(() => console.log("Connected to DB"))
  .catch(console.log);
