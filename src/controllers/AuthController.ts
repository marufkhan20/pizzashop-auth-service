import type { NextFunction, Response } from "express";
import type {
  AuthRequest,
  LoginUserRequest,
  RegisterUserRequest,
} from "../types/index.ts";
import type { UserService } from "../services/UserService.ts";
import { injectable, inject } from "inversify";
import TYPES from "../config/types.ts";
import type { Logger } from "winston";
import { validationResult } from "express-validator";
import type { TokenService } from "../services/TokenService.ts";
import type { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import type { HashService } from "../services/HashService.ts";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.UserService) private userService: UserService,
    @inject(TYPES.TokenService) private tokenService: TokenService,
    @inject(TYPES.logger) private logger: Logger,
    @inject(TYPES.HashService) private hashService: HashService,
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
      const payload: JwtPayload = {
        sub: String(newUser.id),
        role: newUser.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token in the database
      const newRefreshToken =
        await this.tokenService.persistRefreshToken(newUser);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
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

  async login(req: LoginUserRequest, res: Response, next: NextFunction) {
    // check validation
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array(),
      });
    }

    // extract body data
    const { email, password } = req.body;

    this.logger.debug("New request to login a user", {
      email,
      password: "****",
    });

    try {
      // find user
      const user = await this.userService.findByEmail(email);

      if (!user) {
        const error = createHttpError(400, "Email or Password are invalid!!");
        return next(error);
      }

      // verify the password
      const isPasswordValid = await this.hashService.verify({
        password,
        hashedPassword: user.password,
      });

      if (!isPasswordValid) {
        const err = createHttpError(400, "Email or Password is invalid!");
        return next(err);
      }

      // generate access and refresh tokens
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token in the database
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
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

      res.status(200).json({
        id: user.id,
      });
    } catch (error) {
      next(error);
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(req.auth.sub);
    res.json(user);
  }
}
