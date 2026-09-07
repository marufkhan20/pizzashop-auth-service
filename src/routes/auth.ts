import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { AuthController } from "../controllers/AuthController.ts";
import container from "../config/container.ts";
import TYPES from "../config/types.ts";
import registerValidator from "../validators/registerValidator.ts";
import loginValidator from "../validators/loginValidator.ts";
import authenticate from "../middlewares/authenticate.ts";
import type { AuthRequest } from "../types/index.ts";
import validateRefreshToken from "../middlewares/validateRefreshToken.ts";
import parseRefreshToken from "../middlewares/parseRefreshToken.ts";

const router = express.Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.post(
  "/register",
  registerValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next),
);

router.post(
  "/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next),
);

router.get("/self", authenticate, (req: Request, res: Response) =>
  authController.self(req as AuthRequest, res),
);

router.post(
  "/refresh",
  validateRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next),
);

router.post(
  "/logout",
  authenticate,
  parseRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as AuthRequest, res, next),
);

export default router;
