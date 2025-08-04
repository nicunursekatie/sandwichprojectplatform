import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client (for server-side verification)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseServiceKey) {
  console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY not set. Using anon key for auth verification.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || '');

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to verify Supabase JWT tokens
 */
export const verifySupabaseToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Authentication verification failed' });
  }
};

/**
 * Middleware to optionally verify Supabase token (doesn't fail if no token)
 */
export const optionalSupabaseAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.substring(7);
    const { data: { user } } = await supabase.auth.getUser(token);

    // Attach user if token is valid, otherwise continue without
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user on error
    next();
  }
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.user_metadata?.role || 'viewer';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Helper to sync Supabase user with your database
 */
export const syncSupabaseUser = async (supabaseUser: any) => {
  // This function can be used to sync Supabase Auth users
  // with your existing users table if needed
  const userData = {
    id: supabaseUser.id,
    email: supabaseUser.email,
    firstName: supabaseUser.user_metadata?.firstName || '',
    lastName: supabaseUser.user_metadata?.lastName || '',
    role: supabaseUser.user_metadata?.role || 'viewer',
    isActive: true,
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(),
  };

  // TODO: Update your database with userData
  // await storage.upsertUser(userData);
  
  return userData;
};