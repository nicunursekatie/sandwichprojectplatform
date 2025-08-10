import { createClient } from '@supabase/supabase-js';
import { getDefaultPermissionsForRole } from '../../shared/auth-utils';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface SupabaseUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

/**
 * Get user data from Supabase user_permissions_summary view
 * This ensures we're using Supabase as the single source of truth for users
 */
export async function getSupabaseUserData(supabaseUser: any): Promise<SupabaseUserData | null> {
  if (!supabaseUser || !supabaseUser.id) {
    console.error('Invalid Supabase user object');
    return null;
  }

  try {
    // Query the user_permissions_summary view in Supabase
    const { data: userData, error } = await supabase
      .from('user_permissions_summary')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    
    if (error) {
      console.error('Error fetching user from user_permissions_summary:', error);
      // Fallback to basic user data from auth metadata
      const role = supabaseUser.user_metadata?.role || 'viewer';
      return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        firstName: supabaseUser.user_metadata?.firstName || supabaseUser.user_metadata?.first_name || '',
        lastName: supabaseUser.user_metadata?.lastName || supabaseUser.user_metadata?.last_name || '',
        displayName: supabaseUser.user_metadata?.display_name || 
                     `${supabaseUser.user_metadata?.firstName || ''} ${supabaseUser.user_metadata?.lastName || ''}`.trim() ||
                     supabaseUser.email?.split('@')[0] || '',
        role: role,
        permissions: getDefaultPermissionsForRole(role),
        isActive: true
      };
    }

    // Return user data from Supabase view
    return {
      id: userData.id,
      email: userData.email,
      firstName: supabaseUser.user_metadata?.firstName || supabaseUser.user_metadata?.first_name || '',
      lastName: supabaseUser.user_metadata?.lastName || supabaseUser.user_metadata?.last_name || '',
      displayName: supabaseUser.user_metadata?.display_name || 
                   `${supabaseUser.user_metadata?.firstName || ''} ${supabaseUser.user_metadata?.lastName || ''}`.trim() ||
                   userData.email?.split('@')[0] || '',
      role: userData.role || 'viewer',
      permissions: userData.permissions || getDefaultPermissionsForRole(userData.role || 'viewer'),
      isActive: true
    };
  } catch (error) {
    console.error('Error in getSupabaseUserData:', error);
    return null;
  }
}

/**
 * Get user data by email from Supabase
 * This is for looking up other users, not for authentication
 */
export async function getSupabaseUserDataByEmail(email: string): Promise<SupabaseUserData | null> {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return null;
    }

    const supabaseUser = data.users.find(user => user.email === email);
    if (!supabaseUser) {
      return null;
    }

    return getSupabaseUserData(supabaseUser);
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Check if a user exists in Supabase by email
 */
export async function checkSupabaseUserByEmail(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      return false;
    }

    return data.users.some(user => user.email === email);
  } catch (error) {
    console.error('Error checking user by email:', error);
    return false;
  }
}