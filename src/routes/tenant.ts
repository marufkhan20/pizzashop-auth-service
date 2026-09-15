import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import container from "../config/container.ts";
import TYPES from "../config/types.ts";
import { Roles } from "../constants/index.ts";
import type { TenantController } from "../controllers/TenantController.ts";
import authenticate from "../middlewares/authenticate.ts";
import { canAccess } from "../middlewares/canAccess.ts";
import type { CreateTenantRequest } from "../types/index.ts";
import listUsersValidator from "../validators/listUsersValidator.ts";
import tenantValidator from "../validators/tenantValidator.ts";

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

router.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next) as unknown as RequestHandler,
);
router.get(
  "/",
  listUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAll(req, res, next) as unknown as RequestHandler,
);
router.get(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) =>
    tenantController.getOne(req, res, next) as unknown as RequestHandler,
);
router.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) =>
    tenantController.destroy(req, res, next) as unknown as RequestHandler,
);

export default router;
