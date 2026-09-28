import { jest } from "@jest/globals";
import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.ts";
import { Roles } from "../../src/constants/index.ts";
import { User } from "../../src/entities/User.ts";
import { HashService } from "../../src/services/HashService.ts";
import { UserService } from "../../src/services/UserService.ts";

describe("UserService#createAdminUser", () => {
  let connection: DataSource;
  let userService: UserService;

  const adminData = {
    firstName: "Super",
    lastName: "Admin",
    email: "admin@pizzashop.com",
    password: "Admin@12345",
  };

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
    userService = new UserService(
      connection.getRepository(User),
      new HashService(),
    );
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it("creates the admin user when none exists", async () => {
    const result = await userService.createAdminUser(adminData);

    expect(result).toEqual({ created: true });

    const users = await connection.getRepository(User).find();
    expect(users).toHaveLength(1);
    expect(users[0]!.email).toBe(adminData.email);
    expect(users[0]!.role).toBe(Roles.ADMIN);
  });

  it("does not create a duplicate admin when called again", async () => {
    await userService.createAdminUser(adminData);

    const secondResult = await userService.createAdminUser(adminData);

    expect(secondResult).toEqual({ created: false });

    const users = await connection.getRepository(User).find();
    expect(users).toHaveLength(1);
  });

  it("only lets one of several concurrent seed attempts create the admin", async () => {
    const results = await Promise.all([
      userService.createAdminUser(adminData),
      userService.createAdminUser(adminData),
      userService.createAdminUser(adminData),
    ]);

    const createdCount = results.filter((result) => result.created).length;
    expect(createdCount).toBe(1);

    const users = await connection.getRepository(User).find();
    expect(users).toHaveLength(1);
  });

  it("rethrows errors that are not a unique-constraint violation", async () => {
    const userRepository = connection.getRepository(User);
    const insertSpy = jest
      .spyOn(userRepository, "insert")
      .mockRejectedValueOnce(new Error("connection lost"));

    const isolatedService = new UserService(userRepository, new HashService());

    await expect(isolatedService.createAdminUser(adminData)).rejects.toThrow(
      "connection lost",
    );

    insertSpy.mockRestore();
  });
});
