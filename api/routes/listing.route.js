import express from "express";
import { verifyJwtToken } from "../utils/verifyUser.js";
import {
  handleCreateListing,
  handleDeleteListing,
  handleUpdateListing,
  handleGetListing,
  handleSearchListings,
} from "../controllers/listing.controller.js";

const router = express.Router();

router.post("/create", verifyJwtToken, handleCreateListing);
router.delete("/delete/:id", verifyJwtToken, handleDeleteListing);
router.patch("/update/:id", verifyJwtToken, handleUpdateListing);
router.get("/get/:id", handleGetListing);
router.get("/search", handleSearchListings);

export default router;
