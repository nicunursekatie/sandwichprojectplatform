import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPermissions() {
  console.log('🔍 Checking user permissions...\n');
  
  // Get admin users
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('❌ Error fetching users:', userError);
    return;
  }
  
  const adminEmails = ['admin@sandwich.project', 'katielong2316@gmail.com'];
  const adminUsers = users.users.filter(u => adminEmails.includes(u.email || ''));
  
  for (const user of adminUsers) {
    console.log(`\n📧 User: ${user.email}`);
    console.log(`🆔 ID: ${user.id}`);
    
    // Check permissions
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select('permission')
      .eq('user_id', user.id)
      .order('permission');
    
    if (permError) {
      console.error(`❌ Error fetching permissions:`, permError);
    } else if (permissions && permissions.length > 0) {
      console.log(`✅ Has ${permissions.length} permissions:`);
      permissions.slice(0, 5).forEach(p => console.log(`   - ${p.permission}`));
      if (permissions.length > 5) {
        console.log(`   ... and ${permissions.length - 5} more`);
      }
    } else {
      console.log('⚠️  No permissions found');
    }
  }
  
  // Check if table exists
  const { count, error: countError } = await supabase
    .from('user_permissions')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Total permission records in database: ${count || 0}`);
}

checkPermissions().catch(console.error);