import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client (for server-side verification)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not set. Server-side auth verification will fail.');
} else {
  console.log('[Supabase Auth] Service role key loaded, length:', supabaseServiceKey.length);
  console.log('[Supabase Auth] Supabase URL:', supabaseUrl);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    console.log('[Supabase Auth] Verifying token for:', req.method, req.path);
    console.log('[Supabase Auth] Authorization header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Supabase Auth] No Bearer token found');
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('[Supabase Auth] Token length:', token.length);

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('[Supabase Auth] Token verification failed:', error?.message || 'No user returned');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    console.log('[Supabase Auth] Token verified for user:', user.email);

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
    console.log('OptionalSupabaseAuth - Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('OptionalSupabaseAuth - Full header:', authHeader?.substring(0, 50) + '...');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      console.log('OptionalSupabaseAuth - No Bearer token found');
      return next();
    }

    const token = authHeader.substring(7);
    console.log('OptionalSupabaseAuth - Token length:', token.length);
    console.log('OptionalSupabaseAuth - Token preview:', token.substring(0, 20) + '...');
    console.log('OptionalSupabaseAuth - Verifying token...');
    
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.log('OptionalSupabaseAuth - Token verification error:', error.message);
      console.log('OptionalSupabaseAuth - Error code:', error.code);
      console.log('OptionalSupabaseAuth - Error status:', error.status);
    }

    // Attach user if token is valid, otherwise continue without
    if (user) {
      console.log('OptionalSupabaseAuth - User authenticated:', user.email);
      console.log('OptionalSupabaseAuth - User metadata:', user.user_metadata);
      req.user = user;
    } else {
      console.log('OptionalSupabaseAuth - No user found for token');
    }
    
    next();
  } catch (error) {
    console.error('OptionalSupabaseAuth - Unexpected error:', error);
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