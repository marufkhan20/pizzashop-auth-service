import { Container } from "inversify";
import { AppDataSource } from "./data-source.ts";
import { User } from "../entities/User.ts";
import { UserService } from "../services/UserService.ts";
import { AuthController } from "../controllers/AuthController.ts";
import TYPES from "./types.ts";
import logger from "./logger.ts";
import { HashService } from "../services/HashService.ts";

const container = new Container();

container
  .bind(TYPES.UserRepository)
  .toDynamicValue(() => AppDataSource.getRepository(User));

container.bind(TYPES.UserService).to(UserService);
container.bind(TYPES.HashService).to(HashService);
container.bind(TYPES.AuthController).to(AuthController);
container.bind(TYPES.logger).toConstantValue(logger);

export default container;
