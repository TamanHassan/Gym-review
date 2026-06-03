import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getUserRole } from "../services/database.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const role = await getUserRole(req.user.uid);
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      role: role || "member",
      message: "This is your protected profile"
    });
  } catch (error) {
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      role: "member",
      message: "This is your protected profile"
    });
  }
});

export default router;