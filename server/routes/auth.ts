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

// Get user profile
router.get("/auth/profile", optionalSupabaseAuth, (req, res) => {
  console.log('GET /api/auth/profile - User:', req.user ? req.user.email : 'No user');
  
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Return the user profile data
  const profileData = {
    id: req.user.id,
    email: req.user.email,
    firstName: req.user.user_metadata?.firstName || req.user.user_metadata?.first_name || "",
    lastName: req.user.user_metadata?.lastName || req.user.user_metadata?.last_name || "",
    displayName: req.user.user_metadata?.display_name || `${req.user.user_metadata?.firstName || ''} ${req.user.user_metadata?.lastName || ''}`.trim() || req.user.email?.split('@')[0] || "",
    role: req.user.user_metadata?.role || "viewer",
    permissions: req.user.user_metadata?.permissions || []
  };
  
  console.log('Returning profile data:', profileData);
  res.json(profileData);
});

// Update user profile
router.put("/auth/profile", optionalSupabaseAuth, async (req, res) => {
  console.log('PUT /api/auth/profile - User:', req.user ? req.user.email : 'No user');
  console.log('Request body:', req.body);
  
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { firstName, lastName, displayName, email } = req.body;
    
    // Update user metadata in Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not set');
      return res.status(500).json({ message: "Server configuration error" });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Prepare updated metadata
    const updatedMetadata = {
      ...req.user.user_metadata,
      firstName: firstName !== undefined ? firstName : req.user.user_metadata?.firstName,
      lastName: lastName !== undefined ? lastName : req.user.user_metadata?.lastName,
      first_name: firstName !== undefined ? firstName : req.user.user_metadata?.first_name,
      last_name: lastName !== undefined ? lastName : req.user.user_metadata?.last_name,
      display_name: displayName !== undefined ? displayName : req.user.user_metadata?.display_name
    };
    
    console.log('Updating user metadata:', updatedMetadata);
    
    const { data, error } = await supabase.auth.admin.updateUserById(
      req.user.id,
      {
        user_metadata: updatedMetadata
      }
    );

    if (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ message: "Failed to update profile", error: error.message });
    }

    console.log('Profile updated successfully');
    res.json({ 
      message: "Profile updated successfully",
      user: data.user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  // With Supabase, logout is handled client-side
  // This is just for compatibility
  res.status(200).json({ message: "Logged out successfully" });
});

export { router as authRoutes };