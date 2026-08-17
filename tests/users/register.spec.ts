import request from "supertest";
import app from "../../src/app.ts";

describe("POST /auth/register", () => {
  describe("Given all fields", () => {
    it("should return the 201 status code", async () => {
      // Arrange
      const userData = {
        firstName: "Rashedul",
        lastName: "Islam",
        email: "marufkhan@gmail.com",
        password: "marufkhan",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });
  });
});
