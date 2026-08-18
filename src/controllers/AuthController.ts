import type { Response } from "express";
import type { RegisterUserRequest } from "../types/index.ts";
import type { UserService } from "../services/UserService.ts";
import { injectable, inject } from "inversify";
import TYPES from "../config/types.ts";

@injectable()
export class AuthController {
  constructor(@inject(TYPES.UserService) private userService: UserService) {}

  async register(req: RegisterUserRequest, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    await this.userService.create({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(201).json();
  }
}
