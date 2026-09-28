import app from "./app.ts";
import container from "./config/container.ts";
import { AppDataSource } from "./config/data-source.ts";
import { Config } from "./config/index.ts";
import logger from "./config/logger.ts";
import { seedAdminUser } from "./config/seedAdmin.ts";
import TYPES from "./config/types.ts";
import type { UserService } from "./services/UserService.ts";

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    // Connecting to the database
    await AppDataSource.initialize();

    logger.info("Database connected successfully");

    // Seed the default admin user. Test suites manage their own data via
    // `synchronize` + fixtures, so this shouldn't run during tests.
    if (Config.NODE_ENV !== "test") {
      const userService = container.get<UserService>(TYPES.UserService);
      await seedAdminUser(userService);
    }

    // Listening on the specified port
    app.listen(PORT, () => logger.info("Listening on PORT", { port: PORT }));
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(error.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

startServer();
