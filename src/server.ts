import app from "./app.ts";
import container from "./config/container.ts";
import { AppDataSource } from "./config/data-source.ts";
import { Config } from "./config/index.ts";
import logger from "./config/logger.ts";
import TYPES from "./config/types.ts";
import type { UserService } from "./services/UserService.ts";

// Create admin user
const seedAdminUser = async () => {
  // Test suites manage their own data via `synchronize` + fixtures, so
  // this seed shouldn't run (and doesn't have DB state) during tests.
  if (Config.NODE_ENV === "test") return;

  const userService = container.get<UserService>(TYPES.UserService);

  const { created } = await userService.createAdminUser({
    firstName: Config.ADMIN_FIRST_NAME,
    lastName: Config.ADMIN_LAST_NAME,
    email: Config.ADMIN_EMAIL,
    password: Config.ADMIN_PASSWORD,
  });

  logger.info(
    created
      ? "Default admin user created"
      : "Default admin user already exists, skipping creation",
  );
};

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    // Connecting to the database
    await AppDataSource.initialize();

    logger.info("Database connected successfully");

    // Seed the default admin user
    await seedAdminUser();

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
