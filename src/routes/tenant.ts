import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import container from "../config/container.ts";
import TYPES from "../config/types.ts";
import { Roles } from "../constants/index.ts";
import type { TenantController } from "../controllers/TenantController.ts";
import authenticate from "../middlewares/authenticate.ts";
import { canAccess } from "../middlewares/canAccess.ts";

const router = express.Router();

const tenantController = container.get<TenantController>(
  TYPES.TenantController,
);

router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next),
);

export default router;
