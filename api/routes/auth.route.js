import express from "express";
import { handleSignUp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sign-up", handleSignUp);

export default router;
