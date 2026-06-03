import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import { resetDatabase, setUserRole, createUserOrGetRole } from "../../src/services/database.js";

// Mock token for testing
const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.test";
const OWNER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LW93bmVyIiwiZW1haWwiOiJvd25lckBleGFtcGxlLmNvbSJ9.test";

let app;

describe("Gym routes", () => {
  beforeEach(async () => {
    resetDatabase();
    // Dynamically import app to avoid module loading issues
    if (!app) {
      const appModule = await import("../../src/app.js");
      app = appModule.default;
    }
  });

  describe("GET /gyms", () => {
    it("should return 200 and an array of gyms", async () => {
      const response = await request(app).get("/gyms");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return gym data with correct structure", async () => {
      const response = await request(app).get("/gyms");

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty("id");
      expect(response.body[0]).toHaveProperty("name");
      expect(response.body[0]).toHaveProperty("location");
      expect(response.body[0]).toHaveProperty("reviews");
    });
  });

  describe("GET /gyms/:id", () => {
    it("should return 200 and a specific gym", async () => {
      const response = await request(app).get("/gyms/1");

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe("Nordic Fitness");
    });

    it("should return 404 for invalid gym id", async () => {
      const response = await request(app).get("/gyms/999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Gym not found");
    });
  });

  describe("POST /gyms", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).post("/gyms").send({
        name: "New Gym",
        location: "Copenhagen"
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 403 for non-owner user (employee)", async () => {
      const newGym = {
        name: "New Gym",
        location: "Copenhagen"
      };

      const response = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`)
        .send(newGym);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Forbidden");
      expect(response.body.message).toBe("Only owners can create gyms");
    });

    it.skip("should return 201 and create a gym with owner token", async () => {
      // Create the user with owner role
      await createUserOrGetRole("test-owner", "owner@example.com", "owner");

      const newGym = {
        name: "New Gym",
        location: "Copenhagen"
      };

      const response = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${OWNER_TOKEN}`)
        .send(newGym);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("New Gym");
      expect(response.body.location).toBe("Copenhagen");
      expect(response.body).toHaveProperty("id");
    });

    it("should return 400 if name or location is missing", async () => {
      await setUserRole("test-owner", "owner");

      const response = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${OWNER_TOKEN}`)
        .send({ name: "Incomplete Gym" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Bad Request");
    });
  });

  describe("POST /gyms/:id/reviews", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).post("/gyms/1/reviews").send({
        rating: 5,
        comment: "Great gym!"
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 404 if gym does not exist", async () => {
      const response = await request(app)
        .post("/gyms/999/reviews")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`)
        .send({
          rating: 5,
          comment: "Great gym!"
        });

      expect(response.status).toBe(404);
    });

    it("should return 201 and add review with valid token", async () => {
      const review = {
        rating: 5,
        comment: "Great gym!"
      };

      const response = await request(app)
        .post("/gyms/1/reviews")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`)
        .send(review);

      expect(response.status).toBe(201);
      expect(response.body.rating).toBe(5);
      expect(response.body.comment).toBe("Great gym!");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("userId");
      expect(response.body).toHaveProperty("createdAt");
    });

    it("should return 400 if rating is invalid", async () => {
      const response = await request(app)
        .post("/gyms/1/reviews")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`)
        .send({
          rating: 10,
          comment: "Invalid rating"
        });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /gyms/:id", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).delete("/gyms/1");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 404 for invalid gym id", async () => {
      const response = await request(app)
        .delete("/gyms/999")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Gym not found");
    });

    it("should return 200 and delete gym with valid token", async () => {
      const response = await request(app)
        .delete("/gyms/1")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Gym deleted successfully");
      expect(response.body.gym).toHaveProperty("id");
      expect(response.body.gym.id).toBe(1);
    });
  });

  describe("DELETE /gyms/:id/reviews/:reviewId", () => {
    it("should return 401 without authentication token", async () => {
      const response = await request(app).delete("/gyms/1/reviews/1");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 404 if gym does not exist", async () => {
      const response = await request(app)
        .delete("/gyms/999/reviews/1")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Gym not found");
    });

    it("should return 404 if review does not exist", async () => {
      const response = await request(app)
        .delete("/gyms/1/reviews/999")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Review not found");
    });

    it("should return 200 and delete review with valid token", async () => {
      // First create a review
      await request(app)
        .post("/gyms/1/reviews")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`)
        .send({
          rating: 5,
          comment: "Test review"
        });

      // Then delete it
      const response = await request(app)
        .delete("/gyms/1/reviews/1")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Review deleted successfully");
      expect(response.body.review).toHaveProperty("id");
    });
  });

  describe("Production behavior", () => {
    it("should return health status and JSON from /api/health", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("should return CORS headers for allowed origin", async () => {
      const origin = process.env.CORS_ORIGIN || "http://localhost:5173";
      const response = await request(app)
        .get("/gyms")
        .set("Origin", origin);

      expect(response.status).toBe(200);
      expect(response.headers["access-control-allow-origin"]).toBe(origin);
    });
  });
});
