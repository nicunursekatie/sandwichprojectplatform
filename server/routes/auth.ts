import { Router } from "express";
import { verifySupabaseToken, optionalSupabaseAuth } from "../middleware/supabase-auth.js";

const router = Router();

// Authentication routes
router.get("/auth/user", optionalSupabaseAuth, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Return the Supabase user data
  res.json({
    id: req.user.id,
    email: req.user.email,
    firstName: req.user.user_metadata?.firstName || "",
    lastName: req.user.user_metadata?.lastName || "",
    role: req.user.user_metadata?.role || "viewer",
    permissions: req.user.user_metadata?.permissions || []
  });
});

// Logout route
router.post("/logout", (req, res) => {
  // With Supabase, logout is handled client-side
  // This is just for compatibility
  res.status(200).json({ message: "Logged out successfully" });
});

export { router as authRoutes };