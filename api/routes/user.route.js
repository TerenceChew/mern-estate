import express from "express";
import {
  handleUpdateUser,
  handleDeleteUser,
  handleGetUserListings,
  handleGetUser,
} from "../controllers/user.controller.js";
import { validateUpdateUser } from "../validations/user.validation.js";
import { verifyJwtToken } from "../utils/verifyUser.js";

const router = express.Router();

router.patch(
  "/update/:id",
  validateUpdateUser,
  verifyJwtToken,
  handleUpdateUser
);
router.delete("/delete/:id", verifyJwtToken, handleDeleteUser);
router.get("/listings/:id", verifyJwtToken, handleGetUserListings);
router.get("/:id", verifyJwtToken, handleGetUser);

export default router;
