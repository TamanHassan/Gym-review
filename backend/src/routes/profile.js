import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getUserRole, createUserOrGetRole } from "../services/database.js";
import { getPrismaClient } from "../services/database.js";

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

router.post("/set-role-by-email", async (req, res) => {
  try {
    const { email, role, uid } = req.body;
    if (!email) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Email is required"
      });
    }
    if (!role || (role !== "member" && role !== "employee")) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Role must be 'member' or 'employee'"
      });
    }

    const client = getPrismaClient();
    if (!client) {
      return res.status(500).json({
        error: "Database not available"
      });
    }

    // Find user by email
    const user = await client.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      // Create user if doesn't exist
      if (!uid) {
        return res.status(400).json({
          error: "Bad Request",
          message: "UID is required to create new user"
        });
      }
      const newUser = await client.user.create({
        data: {
          id: uid,
          email: email,
          role: role
        }
      });
      res.json({
        email: email,
        role: newUser.role,
        message: "User created with role"
      });
    } else {
      // Update existing user role
      const updatedUser = await client.user.update({
        where: { email: email },
        data: { role: role }
      });
      res.json({
        email: email,
        role: updatedUser.role,
        message: "Role updated successfully"
      });
    }
  } catch (error) {
    console.error("Set role by email error:", error);
    res.status(500).json({
      error: "Failed to set role",
      message: error.message
    });
  }
});

export default router;