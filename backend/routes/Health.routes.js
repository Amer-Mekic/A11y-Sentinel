import express from "express";
import { healthCheck } from "../controllers/Health.controller.js";

const router = express.Router();

router.get("/health", healthCheck);

export default router;