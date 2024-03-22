import express from "express";
import { verifyJwtToken } from "../utils/verifyUser.js";
import {
  handleCreateListing,
  handleDeleteListing,
  handleUpdateListing,
  handleGetListing,
  handleSearchListings,
} from "../controllers/listing.controller.js";
import {
  validateCreateListing,
  validateUpdateListing,
  validateSearchListings,
} from "../validations/listing.validation.js";

const router = express.Router();

router.post(
  "/create",
  validateCreateListing,
  verifyJwtToken,
  handleCreateListing
);
router.delete("/delete/:id", verifyJwtToken, handleDeleteListing);
router.patch(
  "/update/:id",
  validateUpdateListing,
  verifyJwtToken,
  handleUpdateListing
);
router.get("/get/:id", handleGetListing);
router.get("/search", validateSearchListings, handleSearchListings);

export default router;
