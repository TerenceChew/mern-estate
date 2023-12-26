import express from "express";
import { handleTest } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/test", handleTest);

export default router;
