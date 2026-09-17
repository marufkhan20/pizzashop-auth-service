import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import container from "../config/container.ts";
import TYPES from "../config/types.ts";
import { Roles } from "../constants/index.ts";
import type { UserController } from "../controllers/UserController.ts";
import authenticate from "../middlewares/authenticate.ts";
import { canAccess } from "../middlewares/canAccess.ts";
import type { UpdateUserRequest } from "../types/index.ts";
import createUserValidator from "../validators/createUserValidator.ts";
import listUsersValidator from "../validators/listUsersValidator.ts";
import updateUserValidator from "../validators/updateUserValidator.ts";

const router = express.Router();

const userController = container.get<UserController>(TYPES.UserController);

router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  createUserValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next),
);

router.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  updateUserValidator,
  (req: UpdateUserRequest, res: Response, next: NextFunction) =>
    userController.update(req, res, next),
);

router.get(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  listUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next),
);

router.get("/:id", authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  userController.getOne(req, res, next),
);

router.delete(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.destroy(req, res, next),
);

export default router;
