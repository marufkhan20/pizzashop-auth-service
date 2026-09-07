import { Container } from "inversify";
import { AuthController } from "../controllers/AuthController.ts";
import { TenantController } from "../controllers/TenantController.ts";
import { RefreshToken } from "../entities/RefreshToken.ts";
import { Tenant } from "../entities/Tenant.ts";
import { User } from "../entities/User.ts";
import { HashService } from "../services/HashService.ts";
import { TenantService } from "../services/TenantService.ts";
import { TokenService } from "../services/TokenService.ts";
import { UserService } from "../services/UserService.ts";
import { AppDataSource } from "./data-source.ts";
import logger from "./logger.ts";
import TYPES from "./types.ts";

const container = new Container();

container
  .bind(TYPES.UserRepository)
  .toDynamicValue(() => AppDataSource.getRepository(User));

container
  .bind(TYPES.RefreshTokenRepository)
  .toDynamicValue(() => AppDataSource.getRepository(RefreshToken));

container
  .bind(TYPES.TenantRepository)
  .toDynamicValue(() => AppDataSource.getRepository(Tenant));

container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.HashService).to(HashService);
container.bind(TYPES.TokenService).to(TokenService);
container.bind(TYPES.TenantService).to(TenantService);
container.bind(TYPES.AuthController).to(AuthController);
container.bind(TYPES.logger).toConstantValue(logger);

container.bind(TYPES.TenantController).to(TenantController);

export default container;
