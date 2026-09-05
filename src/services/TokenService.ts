import fs from "fs";
import path from "path";
import createHttpError from "http-errors";

import { inject, injectable } from "inversify";
import { sign, type JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import TYPES from "../config/types.ts";
import { Config } from "../config/index.ts";

@injectable()
export class TokenService {
  constructor(@inject(TYPES.logger) private logger: Logger) {}

  generateAccessToken(payload: JwtPayload): string {
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
      throw error;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload): string {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.jwtid),
    });

    return refreshToken;
  }
}
