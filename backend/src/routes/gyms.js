import express from "express";
import { gyms } from "../data/gyms.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", (req, res) => {
  res.json(gyms);
});

router.get("/:id", (req, res) => {
  const gym = gyms.find(g => g.id === Number(req.params.id));

  if (!gym) {
    return res.status(404).json({
      message: "Gym not found"
    });
  }

  res.json(gym);
});

// Protected routes
router.post("/", verifyToken, (req, res) => {
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Name and location are required"
    });
  }

  const newGym = {
    id: Math.max(...gyms.map(g => g.id), 0) + 1,
    name,
    location,
    reviews: [],
    createdBy: req.user.uid
  };

  gyms.push(newGym);

  res.status(201).json(newGym);
});

router.post("/:id/reviews", verifyToken, (req, res) => {
  const gym = gyms.find(g => g.id === Number(req.params.id));

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

  const review = {
    id: Math.max(...gym.reviews.map(r => r.id), 0) + 1,
    rating,
    comment,
    userId: req.user.uid,
    createdAt: new Date().toISOString()
  };

  gym.reviews.push(review);

  res.status(201).json(review);
});

export default router;