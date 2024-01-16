import express from "express";
import {
  handleTest,
  handleUpdateUser,
  handleDeleteUser,
  handleGetUserListings,
} from "../controllers/user.controller.js";
import { verifyJwtToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", handleTest);
router.patch("/update/:id", verifyJwtToken, handleUpdateUser);
router.delete("/delete/:id", verifyJwtToken, handleDeleteUser);
router.get("/listings/:id", verifyJwtToken, handleGetUserListings);

export default router;
