import { expressjwt } from "express-jwt";
import { Config } from "../config/index.ts";
import type { Request } from "express";
import { AppDataSource } from "../config/data-source.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";
import logger from "../config/logger.ts";
import type { IRefreshTokenPayload } from "../types/index.ts";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET,
  algorithms: ["HS256"],
  getToken(req: Request) {
    const { refreshToken } = req.cookies;
    return refreshToken;
  },
  async isRevoked(req: Request, token) {
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const refreshToken = await refreshTokenRepo.findOne({
        where: {
          id: Number((token?.payload as IRefreshTokenPayload).jwtid),
          user: {
            id: Number(token?.payload.sub),
          },
        },
      });

      return refreshToken === null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      logger.error("Error while getting the refresh token", {
        id: (token?.payload as IRefreshTokenPayload).jwtid,
      });
    }

    return true;
  },
});
