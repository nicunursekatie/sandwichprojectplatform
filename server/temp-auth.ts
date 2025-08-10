import type { Express, RequestHandler } from "express";
import { storage } from "./storage-wrapper";
import { getDefaultPermissionsForRole as getSharedPermissions } from "../shared/auth-utils";

// Using shared permissions from auth-utils

function getDefaultPermissionsForRole(role: string): string[] {
  return getSharedPermissions(role);
}

// Committee-specific permission checking
export const requireCommitteeAccess = (committeeId?: string): RequestHandler => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user;

    // Admins have access to all committees
    if (user.role === 'admin' || user.role === 'admin_coordinator' || user.role === 'admin_viewer') {
      return next();
    }

    // For committee members, check specific committee access
    if (user.role === 'committee_member' && committeeId) {
      try {
        const isMember = await storage.isUserCommitteeMember(user.id, committeeId);
        if (!isMember) {
          return res.status(403).json({ message: "Access denied: Not a member of this committee" });
        }
      } catch (error) {
        console.error("Error checking committee membership:", error);
        return res.status(500).json({ message: "Error verifying committee access" });
      }
    }

    next();
  };
};

// Extend session and request types
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
      role: string;
      permissions: string[];
      isActive: boolean;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        profileImageUrl: string | null;
        role: string;
        permissions: string[];
        isActive: boolean;
      };
    }
  }
}

// Temporary simple authentication for testing
export function setupTempAuth(app: Express) {
  // GET route for login page with registration capability
  app.get("/api/login", (req, res) => {
    const loginHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Sandwich Project - Login</title>
      <style>
        body { 
          font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          margin: 0; 
          background: linear-gradient(135deg, #FEF3C7 0%, #F59E0B 100%);
          background-attachment: fixed;
        }
        .login-card { 
          background: linear-gradient(to bottom, #ffffff 0%, #fef9e7 100%); 
          padding: 2.5rem; 
          border-radius: 16px; 
          box-shadow: 0 10px 25px rgba(245, 158, 11, 0.15), 0 4px 6px rgba(0,0,0,0.1); 
          max-width: 420px; 
          width: 100%; 
          border: 2px solid #F59E0B;
          position: relative;
          overflow: hidden;
        }
        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, #236383 0%, #F59E0B 50%, #EA580C 100%);
        }
        .logo-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .logo-header h1 {
          color: #236383;
          font-size: 1.75rem;
          font-weight: bold;
          margin: 0;
          text-shadow: 0 1px 2px rgba(35, 99, 131, 0.1);
        }
        .logo-header p {
          color: #B45309;
          font-size: 0.95rem;
          margin: 0.5rem 0 0 0;
          font-weight: 500;
        }
        .form-group {
          margin-bottom: 1.25rem;
          text-align: left;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #236383;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #FDE68A;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #FFFBEB;
          box-sizing: border-box;
        }
        .form-group input:focus {
          outline: none;
          border-color: #F59E0B;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
          background: white;
        }
        .btn { 
          background: linear-gradient(135deg, #236383 0%, #1E5A78 100%); 
          color: white; 
          border: none; 
          padding: 14px 28px; 
          border-radius: 8px; 
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(35, 99, 131, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px; 
          font-size: 16px; 
          margin: 10px 0;
          width: 100%;
        }
        .btn:hover { background-color: #1a4d61; }
        .btn-secondary {
          background-color: #6c757d;
        }
        .btn-secondary:hover {
          background-color: #545b62;
        }
        .tab-buttons {
          display: flex;
          margin-bottom: 1.5rem;
          border-radius: 10px;
          overflow: hidden;
          background: #FEF3C7;
          border: 1px solid #F59E0B;
        }
        .tab-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
          color: #B45309;
          transition: all 0.3s ease;
          position: relative;
        }
        .tab-btn:hover {
          background: rgba(245, 158, 11, 0.1);
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #236383 0%, #1E5A78 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(35, 99, 131, 0.3);
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
        .error {
          color: #DC2626;
          font-size: 14px;
          margin-top: 0.75rem;
          padding: 8px 12px;
          background: #FEE2E2;
          border: 1px solid #FECACA;
          border-radius: 6px;
          font-weight: 500;
          display: none; /* Hidden by default */
        }
        .error.show {
          display: block;
        }
        .tab-content p {
          color: #78716C; 
          margin-bottom: 1.5rem; 
          text-align: center;
          font-size: 0.95rem;
        }
      </style>
    </head>
    <body>
      <div class="login-card">
        <div class="logo-header">
          <h1>The Sandwich Project</h1>
          <p>Volunteer Management Platform</p>
        </div>

        <div class="tab-buttons">
          <button class="tab-btn active" onclick="showTab('login')">Login</button>
          <button class="tab-btn" onclick="showTab('register')">Register</button>
        </div>

        <div id="login-tab" class="tab-content active">
          <p>Sign in to access the platform</p>
          <form id="login-form">
            <div class="form-group">
              <label for="login-email">Email:</label>
              <input type="email" id="login-email" name="email" required>
            </div>
            <div class="form-group">
              <label for="login-password">Password:</label>
              <input type="password" id="login-password" name="password" required>
            </div>
            <button type="submit" class="btn">Login</button>
          </form>
          <div id="login-error" class="error"></div>
        </div>

        <div id="register-tab" class="tab-content">
          <p>Create your account</p>
          <form id="register-form">
            <div class="form-group">
              <label for="reg-email">Email:</label>
              <input type="email" id="reg-email" name="email" required>
            </div>
            <div class="form-group">
              <label for="reg-password">Password:</label>
              <input type="password" id="reg-password" name="password" required>
            </div>
            <div class="form-group">
              <label for="reg-first-name">First Name:</label>
              <input type="text" id="reg-first-name" name="firstName" required>
            </div>
            <div class="form-group">
              <label for="reg-last-name">Last Name:</label>
              <input type="text" id="reg-last-name" name="lastName" required>
            </div>
            <button type="submit" class="btn">Register</button>
          </form>
          <div id="register-error" class="error"></div>
        </div>
      </div>

      <script>
        function showTab(tabName) {
          // Hide all tabs
          document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
          });
          document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
          });

          // Clear any error messages
          document.querySelectorAll('.error').forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
          });

          // Show selected tab
          document.getElementById(tabName + '-tab').classList.add('active');
          event.target.classList.add('active');
        }

        document.getElementById('login-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);

          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
              window.location.href = '/';
            } else {
              const errorDiv = document.getElementById('login-error');
              errorDiv.textContent = result.message || 'Login failed';
              errorDiv.classList.add('show');
            }
          } catch (error) {
            const errorDiv = document.getElementById('login-error');
            errorDiv.textContent = 'Login failed: ' + error.message;
            errorDiv.classList.add('show');
          }
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);

          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
              alert('Registration successful! You can now log in.');
              showTab('login');
              document.getElementById('login-email').value = data.email;
            } else {
              const errorDiv = document.getElementById('register-error');
              errorDiv.textContent = result.message || 'Registration failed';
              errorDiv.classList.add('show');
            }
          } catch (error) {
            const errorDiv = document.getElementById('register-error');
            errorDiv.textContent = 'Registration failed: ' + error.message;
            errorDiv.classList.add('show');
          }
        });
      </script>
    </body>
    </html>
    `;
    res.send(loginHtml);
  });

  // User registration endpoint
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false, 
          message: "All fields are required" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "User with this email already exists" 
        });
      }

      // Create new user with unique ID
      const userId = "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      const userRole = role || "volunteer"; // Use provided role or default to volunteer
      const newUser = await storage.createUser({
        id: userId,
        email,
        firstName,
        lastName,
        role: userRole,
        permissions: getDefaultPermissionsForRole(userRole),
        isActive: true,
        profileImageUrl: null,
        metadata: { password } // Store password in metadata for now
      });

      res.json({ success: true, message: "Registration successful" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  });

  // Debug endpoint to check user permissions
  app.get("/api/debug/user/:email", async (req: any, res) => {
    try {
      const email = req.params.email;
      const user = await storage.getUserByEmail(email);
      if (user) {
        res.json({
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Debug user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Debug endpoint to check specific user
  app.get("/api/auth/debug-user/:email", async (req: any, res) => {
    try {
      const { email } = req.params;
      const user = await storage.getUserByEmail(email);
      res.json(user ? { 
        email: user.email, 
        role: user.role, 
        permissions: user.permissions,
        exists: true 
      } : { exists: false });
    } catch (error) {
      console.error("Debug user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Fix existing users with empty permissions endpoint
  app.post("/api/auth/fix-permissions", async (req: any, res) => {
    try {
      console.log("Fixing permissions for existing users...");

      // Get all users and update their permissions to match the shared auth system
      const allUsers = await storage.getAllUsers();

      for (const user of allUsers) {
        let correctPermissions = getDefaultPermissionsForRole(user.role);

        // Special case: Give Katie projects access if requested by admin
        if (user.email === "katielong2316@gmail.com") {
          if (!correctPermissions.includes("view_projects")) {
            correctPermissions = [...correctPermissions, "view_projects"];
            console.log("Adding VIEW_PROJECTS permission to Katie");
          }
          // Force update Katie regardless to ensure she gets projects access
          console.log(`Forcing Katie's permission update. Current: [${Array.isArray(user.permissions) ? user.permissions.join(', ') : 'none'}]`);
          console.log(`New: [${correctPermissions.join(', ')}]`);
        }

        // Update user with correct permissions if they differ, or force update for Katie
        const shouldUpdate = JSON.stringify(user.permissions) !== JSON.stringify(correctPermissions) || 
                           user.email === "katielong2316@gmail.com";

        if (shouldUpdate) {
          console.log(`Updating permissions for ${user.email} (${user.role})`);
          await storage.updateUser(user.id, {
            ...user,
            permissions: correctPermissions
          });
          console.log(`Updated ${user.email} permissions:`, correctPermissions);
        }
      }

      res.json({ success: true, message: "All user permissions fixed" });
    } catch (error) {
      console.error("Fix permissions error:", error);
      res.status(500).json({ success: false, message: "Failed to fix permissions" });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Email and password are required" 
        });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Check password (stored in metadata for now)
      const storedPassword = (user.metadata as any)?.password;
      if (storedPassword !== password) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      // Create session user object
      const sessionUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      };

      // Update last login time
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      // Store user in session with explicit save
      req.session.user = sessionUser;
      req.user = sessionUser;

      // Force session save to ensure persistence
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ success: false, message: "Session save failed" });
        }
        console.log("Session saved successfully for user:", sessionUser.email);
        console.log("Session ID:", req.sessionID);
        console.log("Session data:", req.session);
        res.json({ success: true, user: sessionUser });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  // Legacy temp login endpoint (for backwards compatibility)
  app.post("/api/temp-login", async (req: any, res) => {
    try {
      // Create or get a test admin user
      const testUser = {
        id: "test-admin-user",
        email: "admin@example.com",
        firstName: "Test",
        lastName: "Admin",
        profileImageUrl: null,
        role: "admin",
        permissions: ["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "manage_users"],
        isActive: true,
      };

      // Store user in session
      req.session.user = testUser;

      res.json({ success: true, user: testUser });
    } catch (error) {
      console.error("Temp login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user endpoint - TEMP AUTH VERSION
  app.get("/api/temp-auth/current-user", async (req: any, res) => {
    if (req.session.user) {
      try {
        // Get fresh user data from database to ensure permissions are current
        const dbUser = await storage.getUserByEmail(req.session.user.email);
        if (!dbUser || !dbUser.isActive) {
          return res.status(401).json({ message: "User account not found or inactive" });
        }

        // Standardize authentication - Always use (req as any).user and attach dbUser to request
        (req as any).user = dbUser;

        // Return the database user data instead of session data to include latest profile updates
        res.json({
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          displayName: dbUser.displayName,
          profileImageUrl: dbUser.profileImageUrl,
          role: dbUser.role,
          permissions: dbUser.permissions,
          isActive: dbUser.isActive
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Error fetching user data" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Bridge to Supabase auth - forward to the Supabase auth handler
  app.get("/api/auth/user", async (req: any, res, next) => {
    // Check if there's a Bearer token (Supabase auth)
    if (req.headers.authorization?.startsWith('Bearer ')) {
      // Import and use the Supabase auth middleware
      const { verifySupabaseToken } = await import('./middleware/supabase-auth');
      
      // Use the Supabase auth middleware
      return verifySupabaseToken(req, res, async () => {
        if (!req.user) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        
        try {
          // Get the full user data from local database using email
          const dbUser = await storage.getUserByEmail(req.user.email);
          
          if (!dbUser) {
            console.error(`User ${req.user.email} not found in local database`);
            return res.status(404).json({ message: "User not found in database" });
          }
          
          if (!dbUser.isActive) {
            return res.status(403).json({ message: "User account is inactive" });
          }

          // Return the full user data with permissions from local database
          res.json({
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName || "",
            lastName: dbUser.lastName || "",
            displayName: dbUser.displayName || `${dbUser.firstName} ${dbUser.lastName}`.trim(),
            profileImageUrl: dbUser.profileImageUrl,
            role: dbUser.role,
            permissions: dbUser.permissions || []
          });
        } catch (error) {
          console.error('Error in /api/auth/user endpoint:', error);
          res.status(500).json({ message: "Internal server error" });
        }
      });
    }
    
    // Fall back to session auth if no Bearer token
    if (req.session?.user) {
      try {
        const dbUser = await storage.getUserByEmail(req.session.user.email);
        if (!dbUser || !dbUser.isActive) {
          return res.status(401).json({ message: "User account not found or inactive" });
        }
        
        res.json({
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          displayName: dbUser.displayName,
          profileImageUrl: dbUser.profileImageUrl,
          role: dbUser.role,
          permissions: dbUser.permissions,
          isActive: dbUser.isActive
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Error fetching user data" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Profile management endpoints
  app.get("/api/auth/profile", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.session.user;
      const userData = await storage.getUserByEmail(user.email);
      if (userData) {
        res.json({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          displayName: userData.displayName,
          profileImageUrl: userData.profileImageUrl
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/auth/profile", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.session.user;
      const { firstName, lastName, displayName, email } = req.body;

      const userData = await storage.getUserByEmail(user.email);
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(userData.id, {
        firstName,
        lastName,
        displayName,
        email,
        updatedAt: new Date()
      });

      // Update session with new email if changed
      if (email !== user.email) {
        req.session.user.email = email;
      }

      res.json({
        id: updatedUser?.id,
        email: updatedUser?.email,
        firstName: updatedUser?.firstName,
        lastName: updatedUser?.lastName,
        displayName: updatedUser?.displayName,
        profileImageUrl: updatedUser?.profileImageUrl
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put("/api/auth/change-password", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.session.user;
      const { currentPassword, newPassword } = req.body;

      const userData = await storage.getUserByEmail(user.email);
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check current password
      const storedPassword = (userData.metadata as any)?.password;
      if (!storedPassword || storedPassword !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password
      await storage.updateUser(userData.id, {
        metadata: { ...(userData.metadata as any), password: newPassword },
        updatedAt: new Date()
      });

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Admin endpoint to reset any user's password
  app.put("/api/auth/admin/reset-password", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.session.user;

      // Only admins can reset passwords
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only administrators can reset passwords" });
      }

      const { userEmail, newPassword } = req.body;

      if (!userEmail || !newPassword) {
        return res.status(400).json({ message: "User email and new password are required" });
      }

      const targetUser = await storage.getUserByEmail(userEmail);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update password
      await storage.updateUser(targetUser.id, {
        metadata: { ...targetUser.metadata, password: newPassword },
        updatedAt: new Date()
      });

      res.json({ 
        message: `Password reset successfully for ${userEmail}`,
        newPassword: newPassword // Include for admin convenience
      });
    } catch (error) {
      console.error("Admin password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  console.log('=== AUTHENTICATION MIDDLEWARE ===');
  console.log('URL:', req.method, req.url);
  console.log('req.session exists:', !!req.session);
  console.log('req.session.user exists:', !!req.session?.user);
  console.log('Session ID:', req.sessionID);
  console.log('User email in session:', req.session?.user?.email);

  if (!req.session || !req.session.user) {
    console.log('❌ Authentication failed - no session or user');
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Always fetch fresh user data from database to ensure permissions are current
  try {
    const freshUser = await storage.getUserByEmail(req.session.user.email);
    if (freshUser && freshUser.isActive) {
      // Update session with fresh user data if permissions are missing or changed
      if (!req.session.user.permissions || req.session.user.permissions.length === 0 || 
          JSON.stringify(req.session.user.permissions) !== JSON.stringify(freshUser.permissions)) {
        console.log(`🔄 Updating session for ${freshUser.email} with fresh permissions`);
        req.session.user = {
          id: freshUser.id,
          email: freshUser.email,
          firstName: freshUser.firstName,
          lastName: freshUser.lastName,
          profileImageUrl: freshUser.profileImageUrl,
          role: freshUser.role,
          permissions: freshUser.permissions,
          isActive: freshUser.isActive
        };
        
        // Force session save to ensure persistence
        req.session.save((err) => {
          if (err) console.error('Session save error:', err);
        });
      }
      
      // CRITICAL: Always set req.user to the fresh database user data
      req.user = {
        id: freshUser.id,
        email: freshUser.email,
        firstName: freshUser.firstName,
        lastName: freshUser.lastName,
        profileImageUrl: freshUser.profileImageUrl,
        role: freshUser.role,
        permissions: freshUser.permissions,
        isActive: freshUser.isActive
      };
      
      console.log(`✅ Authentication successful for ${freshUser.email} (${freshUser.role})`);
      console.log(`✅ req.user set with ${freshUser.permissions?.length || 0} permissions`);
    } else {
      console.log(`❌ User not found or inactive: ${req.session.user.email}`);
      // User not found in database or inactive, clear invalid session
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("❌ Error fetching fresh user data in isAuthenticated:", error);
    // Fallback to session user if database fetch fails but still set req.user
    req.user = req.session.user;
    console.log(`⚠️ Fallback: Using session user for ${req.session.user.email}`);
  }
  
  next();
};

// Permission checking middleware
export const requirePermission = (permission: string): RequestHandler => {
  return async (req: any, res, next) => {
    // First ensure the user is authenticated
    if (!req.user && req.session?.user) {
      // If req.user is missing but session exists, try to set it from session
      try {
        const freshUser = await storage.getUserByEmail(req.session.user.email);
        if (freshUser && freshUser.isActive) {
          req.user = freshUser;
          console.log(`🔧 requirePermission: Set req.user from fresh DB data for ${freshUser.email}`);
        }
      } catch (error) {
        console.error("Error setting req.user in requirePermission:", error);
      }
    }
    
    const user = req.user || req.session?.user;
    if (!user) {
      console.log(`❌ requirePermission: No user context for ${permission}`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Super admins have all permissions
    if (user.role === "super_admin" || user.role === "admin") {
      console.log(`✅ requirePermission: Admin access granted for ${permission} to ${user.email}`);
      return next();
    }

    // Check specific permission
    if (user.permissions && user.permissions.includes(permission)) {
      console.log(`✅ requirePermission: Permission ${permission} granted to ${user.email}`);
      return next();
    }

    console.log(`❌ requirePermission: Permission ${permission} denied for ${user.email} (role: ${user.role})`);
    console.log(`   User permissions:`, user.permissions);
    return res.status(403).json({ 
      message: "Insufficient permissions",
      required: permission,
      userRole: user.role,
      userPermissions: user.permissions || []
    });
  };
};

// Initialize temporary auth system with default admin user and committees
export async function initializeTempAuth() {
  console.log("Temporary authentication system initialized");

  // Create default admin user if it doesn't exist
  try {
    const adminEmail = "admin@sandwich.project";
    const existingAdmin = await storage.getUserByEmail(adminEmail);

    if (!existingAdmin) {
      const adminId = "admin_" + Date.now();
      await storage.createUser({
        id: adminId,
        email: adminEmail,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        permissions: getDefaultPermissionsForRole("admin"),
        isActive: true,
        profileImageUrl: null,
        metadata: { password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123" } // Use env var or fallback
      });
      console.log("✅ Default admin user created: admin@sandwich.project / [password set from env or default]");
    } else {
      console.log("✅ Default admin user already exists: admin@sandwich.project");
    }
  } catch (error) {
    console.log("❌ Could not create default admin user (using fallback):", error.message);
  }

  // Setup default committees and committee member user
  try {
    // Create default committees if they don't exist
    try {
      const committees = await storage.getAllCommittees();
      if (committees.length === 0) {
        await storage.createCommittee({ name: "Finance", description: "Financial oversight and budgeting" });
        await storage.createCommittee({ name: "Operations", description: "Day-to-day operations management" });
        await storage.createCommittee({ name: "Outreach", description: "Community outreach and partnerships" });
        console.log("✅ Default committees created");
      }
    } catch (error) {
      console.warn("Committee creation failed:", error.message);
    }

    // Create committee member user and assign to specific committee
    const committeeEmail = "katielong2316@gmail.com";
    const existingCommitteeMember = await storage.getUserByEmail(committeeEmail);

    let committeeMemberId;
    if (!existingCommitteeMember) {
      committeeMemberId = "committee_" + Date.now();
      await storage.createUser({
        id: committeeMemberId,
        email: committeeEmail,
        firstName: "Katie",
        lastName: "Long",
        role: "committee_member",
        permissions: getDefaultPermissionsForRole("committee_member"),
        isActive: true,
        profileImageUrl: null,
        metadata: { password: process.env.DEFAULT_COMMITTEE_PASSWORD || "committee123" }
      });
      console.log("✅ Committee member user created: katielong2316@gmail.com / [password set from env or default]");
    } else {
      // Use existing user without updating role (preserve current role and permissions)
      committeeMemberId = existingCommitteeMember.id;
      console.log("✅ Found existing user: katielong2316@gmail.com (preserving current role and permissions)");
    }

    // Assign committee member to finance committee only
    try {
      const katie = await storage.getUserByEmail("katielong2316@gmail.com");

      if (katie) {
        // Get Finance committee ID
        const committees = await storage.getAllCommittees();
        const financeCommittee = committees.find(c => c.name.toLowerCase() === "finance");

        if (financeCommittee) {
          // Check if Katie is already in Finance committee
          const isFinanceMember = await storage.isUserCommitteeMember(katie.id, financeCommittee.id);
          if (!isFinanceMember) {
            await storage.addUserToCommittee({
              userId: katie.id,
              committeeId: financeCommittee.id,
              role: "member"
            });
          }
          console.log("✅ Assigned katielong2316@gmail.com to Finance Committee only");
        }
      }
    } catch (error) {
      console.warn("Assigning committee member failed:", error.message);
    }

  } catch (error) {
    console.log("❌ Could not setup committees:", error.message);
  }

  // Setup driver user - kenig.ka@gmail.com with restricted permissions
  try {
    const driverEmail = "kenig.ka@gmail.com";
    const existingDriver = await storage.getUserByEmail(driverEmail);

    if (!existingDriver) {
      const driverId = `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await storage.createUser({
        id: driverId,
        email: driverEmail,
        firstName: "Ken",
        lastName: "Ig",
        role: "driver",
        permissions: getDefaultPermissionsForRole("driver"),
        isActive: true,
        profileImageUrl: null,
        metadata: { password: process.env.DEFAULT_DRIVER_PASSWORD || "driver123" }
      });
      console.log("✅ Driver user created: kenig.ka@gmail.com / [password set from env or default]");
    } else {
      // Preserve existing user permissions - do not reset them
      console.log("✅ Found existing user: kenig.ka@gmail.com (preserving current role and permissions)");
    }
  } catch (error) {
    console.log("❌ Could not setup driver user:", error.message);
  }
}