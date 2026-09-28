import { jest } from "@jest/globals";
import { Config } from "../../src/config/index.ts";
import logger from "../../src/config/logger.ts";
import { seedAdminUser } from "../../src/config/seedAdmin.ts";
import type { UserService } from "../../src/services/UserService.ts";

describe("seedAdminUser", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls UserService with the configured admin details and logs creation", async () => {
    const infoSpy = jest.spyOn(logger, "info").mockImplementation();
    const createAdminUser = jest.fn().mockResolvedValue({ created: true });
    const userService = { createAdminUser } as unknown as UserService;

    await seedAdminUser(userService);

    expect(createAdminUser).toHaveBeenCalledWith({
      firstName: Config.ADMIN_FIRST_NAME,
      lastName: Config.ADMIN_LAST_NAME,
      email: Config.ADMIN_EMAIL,
      password: Config.ADMIN_PASSWORD,
    });
    expect(infoSpy).toHaveBeenCalledWith("Default admin user created");
  });

  it("logs that the admin already exists when nothing was created", async () => {
    const infoSpy = jest.spyOn(logger, "info").mockImplementation();
    const createAdminUser = jest.fn().mockResolvedValue({ created: false });
    const userService = { createAdminUser } as unknown as UserService;

    await seedAdminUser(userService);

    expect(infoSpy).toHaveBeenCalledWith(
      "Default admin user already exists, skipping creation",
    );
  });
});
