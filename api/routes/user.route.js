import express from "express";
import {
  handleTest,
  handleUserUpdate,
} from "../controllers/user.controller.js";
import { verifyJwtToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", handleTest);
router.patch("/update/:id", verifyJwtToken, handleUserUpdate);

export default router;
