import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getUserPermissions(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
  
  return data?.map(p => p.permission) || [];
}

export async function grantPermission(userId: string, permission: string, grantedBy?: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_permissions')
    .insert({
      user_id: userId,
      permission,
      granted_by: grantedBy
    });
  
  if (error) {
    console.error('Error granting permission:', error);
    return false;
  }
  
  return true;
}

export async function revokePermission(userId: string, permission: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('permission', permission);
  
  if (error) {
    console.error('Error revoking permission:', error);
    return false;
  }
  
  return true;
}

export async function setUserPermissions(userId: string, permissions: string[], grantedBy?: string): Promise<boolean> {
  // Start a transaction by deleting all existing permissions and inserting new ones
  try {
    // Delete all existing permissions
    const { error: deleteError } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) throw deleteError;
    
    // Insert new permissions
    if (permissions.length > 0) {
      const permissionRecords = permissions.map(permission => ({
        user_id: userId,
        permission,
        granted_by: grantedBy
      }));
      
      const { error: insertError } = await supabase
        .from('user_permissions')
        .insert(permissionRecords);
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Error setting user permissions:', error);
    return false;
  }
}

export async function getUsersByPermission(permission: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_permissions')
    .select('user_id')
    .eq('permission', permission);
  
  if (error) {
    console.error('Error fetching users by permission:', error);
    return [];
  }
  
  return data?.map(p => p.user_id) || [];
}