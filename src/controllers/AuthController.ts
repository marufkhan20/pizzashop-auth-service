import path from "path";
import fs from "fs";
import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index.ts";
import type { UserService } from "../services/UserService.ts";
import { injectable, inject } from "inversify";
import TYPES from "../config/types.ts";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import { sign, type JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config/index.ts";
import { AppDataSource } from "../config/data-source.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";

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

      // generate access and refresh tokens
      let privateKey: Buffer;

      try {
        privateKey = fs.readFileSync(
          path.join(import.meta.dirname, "../../certs/private.pem"),
        );
      } catch (err) {
        const error = createHttpError(
          500,
          "Failed to read private key for JWT signing",
        );
        this.logger.error(error.message, { error: err });
        return next(error);
      }

      const payload: JwtPayload = {
        sub: String(newUser.id),
        role: newUser.role,
      };

      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "auth-service",
      });

      // Persist the refresh token in the database
      const MS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365; //  1 year
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const newRefreshToken = await refreshTokenRepository.save({
        user: newUser,
        expiresAt: new Date(Date.now() + MS_IN_A_YEAR), // 1 year
      });

      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
        jwtid: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hour
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 365 days
      });

      res.status(201).json({
        id: newUser.id,
      });
    } catch (error) {
      next(error);
    }
  }
}
