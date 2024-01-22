import express from "express";
import { verifyJwtToken } from "../utils/verifyUser.js";
import {
  handleCreateListing,
  handleDeleteListing,
} from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/create", verifyJwtToken, handleCreateListing);
router.delete("/delete/:id", verifyJwtToken, handleDeleteListing);

export default router;
