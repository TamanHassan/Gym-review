import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getUserRole, createUserOrGetRole } from "../services/database.js";

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

router.post("/set-role", verifyToken, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || (role !== "member" && role !== "employee")) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Role must be 'member' or 'employee'"
      });
    }

    const userRole = await createUserOrGetRole(req.user.uid, req.user.email, role);
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      role: userRole,
      message: "Role updated successfully"
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to set role",
      message: error.message
    });
  }
});

export default router;