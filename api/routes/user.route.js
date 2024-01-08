import express from "express";
import {
  handleTest,
  handleUpdateUser,
  handleDeleteUser,
} from "../controllers/user.controller.js";
import { verifyJwtToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", handleTest);
router.patch("/update/:id", verifyJwtToken, handleUpdateUser);
router.delete("/delete/:id", verifyJwtToken, handleDeleteUser);

export default router;
