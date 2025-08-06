import { Router } from "express";
import { verifySupabaseToken, optionalSupabaseAuth } from "../middleware/supabase-auth.js";
import { getDefaultPermissionsForRole } from "../../shared/auth-utils.js";
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase client for database queries
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Authentication routes
router.get("/auth/user", optionalSupabaseAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Get role from user metadata
    const role = req.user.user_metadata?.role || "viewer";
    
    // Fetch permissions from the user_permissions table
    const { data: permissions, error } = await supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', req.user.id);
    
    let userPermissions: string[] = [];
    
    if (error) {
      console.error('Error fetching user permissions:', error);
      // Fallback to role-based permissions if table query fails
      userPermissions = getDefaultPermissionsForRole(role);
    } else if (permissions && permissions.length > 0) {
      // Use permissions from database
      userPermissions = permissions.map(p => p.permission);
    } else {
      // No permissions in database, use role defaults
      userPermissions = getDefaultPermissionsForRole(role);
    }

    // Return the Supabase user data with permissions
    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.user_metadata?.firstName || "",
      lastName: req.user.user_metadata?.lastName || "",
      role: role,
      permissions: userPermissions
    });
  } catch (error) {
    console.error('Error in /auth/user endpoint:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile
router.get("/auth/profile", optionalSupabaseAuth, (req, res) => {
  console.log('GET /api/auth/profile - User:', req.user ? req.user.email : 'No user');
  
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Get role and permissions
  const role = req.user.user_metadata?.role || "viewer";
  const permissions = req.user.user_metadata?.permissions || getDefaultPermissionsForRole(role);

  // Return the user profile data
  const profileData = {
    id: req.user.id,
    email: req.user.email,
    firstName: req.user.user_metadata?.firstName || req.user.user_metadata?.first_name || "",
    lastName: req.user.user_metadata?.lastName || req.user.user_metadata?.last_name || "",
    displayName: req.user.user_metadata?.display_name || `${req.user.user_metadata?.firstName || ''} ${req.user.user_metadata?.lastName || ''}`.trim() || req.user.email?.split('@')[0] || "",
    role: role,
    permissions: permissions
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

// Add permission management endpoints
router.put("/auth/permissions/:userId", verifySupabaseToken, async (req, res) => {
  // Check if requesting user has permission to manage users
  const { data: hasPermission } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', req.user.id)
    .eq('permission', 'manage_users')
    .single();
  
  if (!hasPermission) {
    return res.status(403).json({ message: "Forbidden - insufficient permissions" });
  }
  
  const { userId } = req.params;
  const { permissions } = req.body;
  
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ message: "Permissions must be an array" });
  }
  
  try {
    const { setUserPermissions } = await import('../services/permissions.js');
    const success = await setUserPermissions(userId, permissions, req.user.id);
    
    if (success) {
      res.json({ message: "Permissions updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to update permissions" });
    }
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as authRoutes };