import express from "express";
import { getAllGyms, getGymById, createGym, addReview } from "../services/database.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", async (req, res) => {
  try {
    const gyms = await getAllGyms();
    res.json(gyms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gyms" });
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

export default router;