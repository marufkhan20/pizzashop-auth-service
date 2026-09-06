import type { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.ts";
import request from "supertest";
import app from "../../src/app.ts";
import { createJWKSMock } from "mock-jwks";
import { setupServer } from "msw/node";
import { User } from "../../src/entities/User.ts";
import { Roles } from "../../src/constants/index.ts";

describe("POST /auth/self", () => {
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
    it("should return the 200 status code", async () => {
      const accessToken = jwks.token({
        sub: "1",
        role: Roles.CUSTOMER,
      });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      expect(response.statusCode).toBe(200);
    });

    it("should return the user data", async () => {
      // register user
      const userData = {
        firstName: "Rashedul",
        lastName: "Islam",
        email: "marufkhan@gmail.com",
        password: "marufkhan",
      };

      const userRepository = connection.getRepository(User);
      const user = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      // Generate Token
      const accessToken = jwks.token({
        sub: String(user.id),
        role: user.role,
      });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      expect((response.body as Record<string, unknown>).id).toBe(user.id);
      expect((response.body as Record<string, unknown>).email).toBe(user.email);
    });

    it("should not return the password field", async () => {
      // register user
      const userData = {
        firstName: "Rashedul",
        lastName: "Islam",
        email: "marufkhan@gmail.com",
        password: "marufkhan",
      };

      const userRepository = connection.getRepository(User);
      const user = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      // Generate Token
      const accessToken = jwks.token({
        sub: String(user.id),
        role: user.role,
      });

      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      expect(response.body).not.toHaveProperty("password");
    });

    it("should return 401 status code if token doesn't exists", async () => {
      // register user
      const userData = {
        firstName: "Rashedul",
        lastName: "Islam",
        email: "marufkhan@gmail.com",
        password: "marufkhan",
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      const response = await request(app).get("/auth/self").send();

      expect(response.statusCode).toBe(401);
    });
  });
});
