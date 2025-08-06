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

async function updateAdminUsers() {
  console.log('🔄 Updating admin users roles...');

  // Update admin@sandwich.project
  const adminEmail = 'admin@sandwich.project';
  const { data: adminUser, error: adminError } = await supabase.auth.admin.listUsers();
  
  if (adminError) {
    console.error('❌ Error listing users:', adminError);
    return;
  }

  const admin = adminUser.users.find(u => u.email === adminEmail);
  if (admin) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      admin.id,
      {
        user_metadata: {
          ...admin.user_metadata,
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    );

    if (updateError) {
      console.error(`❌ Error updating ${adminEmail}:`, updateError);
    } else {
      console.log(`✅ Updated ${adminEmail} to admin role`);
    }
  } else {
    console.log(`⚠️  ${adminEmail} not found in Supabase`);
  }

  // Update katielong2316@gmail.com
  const katieEmail = 'katielong2316@gmail.com';
  const katie = adminUser.users.find(u => u.email === katieEmail);
  if (katie) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      katie.id,
      {
        user_metadata: {
          ...katie.user_metadata,
          role: 'admin',
          firstName: 'Katie',
          lastName: 'Long'
        }
      }
    );

    if (updateError) {
      console.error(`❌ Error updating ${katieEmail}:`, updateError);
    } else {
      console.log(`✅ Updated ${katieEmail} to admin role`);
    }
  } else {
    console.log(`⚠️  ${katieEmail} not found in Supabase`);
  }

  console.log('✅ Admin user update complete');
}

updateAdminUsers().catch(console.error);