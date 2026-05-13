import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";

import app from "../../src/app.js";
import { gyms } from "../../src/data/gyms.js";

// Mock token for testing
const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LXVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.test";

describe("Gym routes", () => {
  beforeEach(() => {
    // Reset gyms data before each test
    gyms.length = 0;
    gyms.push(
      { id: 1, name: "Nordic Fitness", location: "Gothenburg", reviews: [] },
      { id: 2, name: "Iron Paradise", location: "Stockholm", reviews: [] }
    );
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

    it("should return 201 and create a gym with valid token", async () => {
      const newGym = {
        name: "New Gym",
        location: "Copenhagen"
      };

      const response = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`)
        .send(newGym);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("New Gym");
      expect(response.body.location).toBe("Copenhagen");
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("createdBy");
    });

    it("should return 400 if name or location is missing", async () => {
      const response = await request(app)
        .post("/gyms")
        .set("Authorization", `Bearer ${MOCK_TOKEN}`)
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
});
