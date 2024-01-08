import express from "express";
import { verifyJwtToken } from "../utils/verifyUser.js";
import { handleCreateListing } from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/create", verifyJwtToken, handleCreateListing);

export default router;
