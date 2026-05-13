import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    message: "This is your protected profile"
  });
});

export default router;