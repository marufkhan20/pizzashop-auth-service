import express from "express";
import { AuthController } from "../controllers/AuthController.ts";
import container from "../config/container.ts";
import TYPES from "../config/types.ts";

const router = express.Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.post("/register", (req, res) => authController.register(req, res));

export default router;
