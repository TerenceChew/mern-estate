import express from "express";
import {
  handleSignUp,
  handleSignIn,
  handleGoogleSignIn,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sign-up", handleSignUp);
router.post("/sign-in", handleSignIn);
router.post("/google-sign-in", handleGoogleSignIn);

export default router;
