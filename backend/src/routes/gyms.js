import express from "express";
import { getAllGyms, getGymById, createGym, addReview, deleteGym, deleteReview, getUserRole } from "../services/database.js";
import { gyms as inMemoryGyms } from "../data/gyms.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", async (req, res) => {
  try {
    const gyms = await getAllGyms();
    if (!Array.isArray(gyms)) {
      console.error("GET /gyms returned invalid data, falling back to in-memory gyms", gyms);
      return res.json(inMemoryGyms);
    }
    res.json(gyms);
  } catch (error) {
    console.error("GET /gyms error:", error);
    res.json(inMemoryGyms);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const gym = await getGymById(req.params.id);

    if (!gym) {
      return res.status(404).json({
        message: "Gym not found"
      });
    }

    res.json(gym);
  } catch (error) {
    console.error(`GET /gyms/${req.params.id} error:`, error);
    res.status(500).json({ error: "Failed to fetch gym" });
  }
});

// Protected routes
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Name and location are required"
      });
    }

    // Check if user has employee role
    const role = await getUserRole(req.user.uid);
    if (role !== "employee") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only employees can create gyms"
      });
    }

    const newGym = await createGym(name, location, req.user.uid);
    res.status(201).json(newGym);
  } catch (error) {
    res.status(500).json({ error: "Failed to create gym" });
  }
});

router.post("/:id/reviews", verifyToken, async (req, res) => {
  try {
    const gym = await getGymById(req.params.id);

    if (!gym) {
      return res.status(404).json({
        message: "Gym not found"
      });
    }

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Rating is required and must be between 1 and 5"
      });
    }

    const review = await addReview(req.params.id, rating, comment, req.user.uid);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Failed to add review" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deletedGym = await deleteGym(req.params.id, req.user.uid);

    if (!deletedGym) {
      return res.status(404).json({
        message: "Gym not found"
      });
    }

    res.json({ message: "Gym deleted successfully", gym: deletedGym });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete gym" });
  }
});

router.delete("/:id/reviews/:reviewId", verifyToken, async (req, res) => {
  try {
    const gym = await getGymById(req.params.id);

    if (!gym) {
      return res.status(404).json({
        message: "Gym not found"
      });
    }

    const deletedReview = await deleteReview(req.params.id, req.params.reviewId, req.user.uid);

    if (!deletedReview) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    res.json({ message: "Review deleted successfully", review: deletedReview });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;