import express from "express";
import { verifyJwtToken } from "../utils/verifyUser.js";
import {
  handleCreateListing,
  handleDeleteListing,
  handleUpdateListing,
} from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/create", verifyJwtToken, handleCreateListing);
router.delete("/delete/:id", verifyJwtToken, handleDeleteListing);
router.patch("/update/:id", verifyJwtToken, handleUpdateListing);

export default router;
