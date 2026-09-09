import { createJWKSMock } from "mock-jwks";
import { setupServer } from "msw/node";
import request from "supertest";
import type { DataSource } from "typeorm";
import app from "../../src/app.ts";
import { AppDataSource } from "../../src/config/data-source.ts";
import { Roles } from "../../src/constants/index.ts";
import { Tenant } from "../../src/entities/Tenant.ts";

describe("POST /tenants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let mswServer: ReturnType<typeof setupServer>;
  let adminToken: string;

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

    adminToken = jwks.token({
      sub: "1",
      role: Roles.ADMIN,
    });
  });

  afterEach(async () => {
    mswServer.resetHandlers();
  });

  afterAll(async () => {
    mswServer.close();
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return a 201 status code", async () => {
      // Arrange
      const tenantData = {
        name: "PizzaBurg",
        address: "Maijdi, Noakhali, BD",
      };

      // Act
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should create a tenant in the database", async () => {
      // Arrange
      const tenantData = {
        name: "PizzaBurg",
        address: "Maijdi, Noakhali, BD",
      };

      // Act
      await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      // Assert
      expect(tenants).toHaveLength(1);
      expect(tenants[0]!.name).toBe(tenantData.name);
      expect(tenants[0]!.address).toBe(tenantData.address);
    });

    it("should return 401 status code if user not authenticated", async () => {
      // Arrange
      const tenantData = {
        name: "PizzaBurg",
        address: "Maijdi, Noakhali, BD",
      };

      // Act
      const response = await request(app).post("/tenants").send(tenantData);

      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenants = await tenantRepository.find();

      // Assert
      expect(tenants).toHaveLength(0);
    });
  });
});
