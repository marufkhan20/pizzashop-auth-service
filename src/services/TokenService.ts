import fs from "fs";
import path from "path";
import createHttpError from "http-errors";

import { inject, injectable } from "inversify";
import jsonwebtoken, { type JwtPayload } from "jsonwebtoken";

const { sign } = jsonwebtoken;
import type { Logger } from "winston";
import TYPES from "../config/types.ts";
import { Config } from "../config/index.ts";
import type { User } from "../entities/User.ts";
import type { RefreshToken } from "../entities/RefreshToken.ts";
import type { Repository } from "typeorm";

@injectable()
export class TokenService {
  constructor(
    @inject(TYPES.logger) private logger: Logger,
    @inject(TYPES.RefreshTokenRepository)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

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

  async persistRefreshToken(user: User) {
    const MS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365; //  1 year
    const newRefreshToken = await this.refreshTokenRepository.save({
      user,
      expiresAt: new Date(Date.now() + MS_IN_A_YEAR), // 1 year
    });

    return newRefreshToken;
  }

  async deleteRefreshToken(id: number) {
    return await this.refreshTokenRepository.delete({ id });
  }
}
