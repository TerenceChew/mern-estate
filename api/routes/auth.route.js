import express from "express";
import { handleSignIn, handleSignUp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sign-up", handleSignUp);
router.post("/sign-in", handleSignIn);

export default router;
