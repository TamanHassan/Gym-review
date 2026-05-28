import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import { resetGyms } from "../src/data/gyms.js";

let app;

describe("Production Behavior Tests", () => {
  beforeEach(async () => {
    resetGyms();
    // Dynamically import app to avoid module loading issues
    if (!app) {
      const appModule = await import("../src/app.js");
      app = appModule.default;
    }
  });

  describe("CORS Headers", () => {
    it("should return CORS headers for valid requests", async () => {
      const response = await request(app)
        .get("/gyms")
        .set("Origin", "http://localhost:5173");

      // Check that CORS headers are present
      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    it("should allow credentials in CORS", async () => {
      const response = await request(app)
        .get("/gyms")
        .set("Origin", "http://localhost:5173");

      // Should allow credentials
      expect(response.headers["access-control-allow-credentials"]).toBeTruthy();
    });

    it("should allow OPTIONS preflight requests", async () => {
      const response = await request(app)
        .options("/gyms")
        .set("Origin", "http://localhost:5173")
        .set("Access-Control-Request-Method", "POST");

      // OPTIONS requests should return 200 or 204 (both are valid)
      expect([200, 204]).toContain(response.status);
    });
  });

  describe("API Response Structure", () => {
    it("should return JSON content-type", async () => {
      const response = await request(app).get("/gyms");

      expect(response.headers["content-type"]).toMatch(/application\/json/);
      expect(response.status).toBe(200);
    });

    it("should handle requests without Authorization header gracefully", async () => {
      const response = await request(app)
        .post("/gyms")
        .send({ name: "Test Gym", location: "Test" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
    });

    it("should return proper error responses", async () => {
      const response = await request(app).get("/gyms/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Production-like Behavior", () => {
    it("should handle multiple concurrent requests", async () => {
      const requests = Array(5)
        .fill(null)
        .map(() => request(app).get("/gyms"));

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    it("should validate required fields in requests", async () => {
      const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.test";

      const response = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`)
        .send({ name: "Incomplete" }); // Missing location

      expect(response.status).toBe(400);
    });

    it("should not expose sensitive headers", async () => {
      const response = await request(app).get("/gyms");

      // Should not expose server details
      expect(response.headers["x-powered-by"]).toBeUndefined();
      const serverHeader = response.headers["server"];
      if (serverHeader) {
        expect(serverHeader).not.toMatch(/Express/);
      }
    });
  });
});
