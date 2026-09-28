import { Config } from "./index.ts";
import logger from "./logger.ts";
import type { UserService } from "../services/UserService.ts";

/**
 * Seeds the default admin user via the given UserService.
 *
 * Kept as a plain function of its dependency (rather than reaching into
 * the DI container itself) so it can be unit tested in isolation with a
 * fake/mocked UserService. See UserService#createAdminUser for how
 * duplicate creation is prevented across concurrent instances.
 */
export const seedAdminUser = async (userService: UserService) => {
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
