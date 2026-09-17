import { createJWKSMock } from "mock-jwks";
import { setupServer } from "msw/node";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app.ts";
import { AppDataSource } from "../../src/config/data-source.ts";
import { Roles } from "../../src/constants/index.ts";
import { Tenant } from "../../src/entities/Tenant.ts";
import { User } from "../../src/entities/User.ts";
import { createTenant } from "../utils/index.ts";

describe("POST /users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let mswServer: ReturnType<typeof setupServer>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();

    mswServer = setupServer(
      jwks.mswHandler as unknown as Parameters<typeof setupServer>[number],
    );
    mswServer.listen({
      onUnhandledRequest: "bypass", // We silence the warnings of msw for unhandled requests. Not necessary for things to work.
    });
  });

  beforeEach(async () => {
    mswServer.resetHandlers();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(async () => {
    mswServer.resetHandlers();
  });

  afterAll(async () => {
    mswServer.close();
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should persist user in the database ", async () => {
      // Generate Token
      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });

      // register user
      const userData = {
        firstName: "Rashedul",
        lastName: "Islam",
        email: "marufkhan@gmail.com",
        password: "marufkhan",
        tenantId: 1,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0]!.email).toBe(userData.email);
    });

    it("should create a manager user ", async () => {
      // Generate Token
      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });

      // register user
      const userData = {
        firstName: "Rashedul",
        lastName: "Islam",
        email: "marufkhan@gmail.com",
        password: "marufkhan",
        tenantId: 1,
      };

      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0]!.role).toBe(Roles.MANAGER);
    });

    it("should return 403 if non admin user tries to create a user", async () => {
      // Create tenant first
      const tenant = await createTenant(connection.getRepository(Tenant));

      const nonAdminToken = jwks.token({
        sub: "1",
        role: Roles.MANAGER,
      });

      const userData = {
        firstName: "Rakesh",
        lastName: "K",
        email: "rakesh@mern.space",
        password: "password",
        tenantId: tenant.id,
      };

      // Add token to cookie
      const response = await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${nonAdminToken}`])
        .send(userData);

      expect(response.statusCode).toBe(403);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(0);
    });
  });
});
