import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index.ts";
import type { UserService } from "../services/UserService.ts";
import { injectable, inject } from "inversify";
import TYPES from "../config/types.ts";
import type { Logger } from "winston";
import { validationResult } from "express-validator";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.UserService) private userService: UserService,
    @inject(TYPES.logger) private logger: Logger,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // check validation
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array(),
      });
    }

    // extract body data
    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New request to register a user", {
      firstName,
      lastName,
      email,
    });

    try {
      // create new user
      const newUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info("User hase been registered.", { id: newUser.id });

      res.status(201).json({
        id: newUser.id,
      });
    } catch (error) {
      next(error);
    }
  }
}
