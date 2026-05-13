import { auth } from "../services/firebase.js";

/**
 * Middleware to verify Firebase ID token
 * Expects token in Authorization header: "Bearer <token>"
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header"
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // In test mode, skip actual verification
    if (!auth.app) {
      req.user = { uid: "test-user-id", email: "test@example.com" };
      return next();
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token"
    });
  }
};
