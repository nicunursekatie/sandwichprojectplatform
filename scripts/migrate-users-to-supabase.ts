#!/usr/bin/env tsx
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { db } from '../server/db';
import { users } from '../shared/schema';

// Initialize Supabase Admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required for user migration');
  console.log('Get it from: https://supabase.com/dashboard/project/mifquzfaqtcyboqntfyn/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function migrateUsers() {
  console.log('🚀 Starting user migration to Supabase Auth...\n');

  try {
    // Get all users from your database
    const existingUsers = await db.select().from(users);
    console.log(`Found ${existingUsers.length} users to migrate\n`);

    const results = {
      success: [],
      skipped: [],
      failed: [],
    };

    for (const user of existingUsers) {
      console.log(`Processing: ${user.email}...`);

      // Skip users without email
      if (!user.email) {
        console.log(`  ⚠️  Skipped (no email)`);
        results.skipped.push({ ...user, reason: 'No email' });
        continue;
      }

      try {
        // Check if user already exists in Supabase
        const { data: existingSupabaseUser } = await supabase.auth.admin.getUserById(user.id);
        
        if (existingSupabaseUser) {
          console.log(`  ⚠️  Skipped (already exists in Supabase)`);
          results.skipped.push({ ...user, reason: 'Already in Supabase' });
          continue;
        }

        // Create user in Supabase Auth
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          email_confirm: true, // Auto-confirm email since they're existing users
          user_metadata: {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role || 'viewer',
            permissions: user.permissions || [],
            originalId: user.id, // Keep reference to original ID
          },
          // Generate a random password - users will need to reset it
          password: generateTempPassword(),
        });

        if (error) {
          console.log(`  ❌ Failed: ${error.message}`);
          results.failed.push({ ...user, error: error.message });
        } else {
          console.log(`  ✅ Success (ID: ${data.user?.id})`);
          results.success.push(user);
        }
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
        results.failed.push({ ...user, error: err.message });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Successfully migrated: ${results.success.length}`);
    console.log(`⚠️  Skipped: ${results.skipped.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);

    if (results.success.length > 0) {
      console.log('\n✅ Successfully migrated users:');
      results.success.forEach(u => console.log(`  - ${u.email} (${u.firstName} ${u.lastName})`));
    }

    if (results.skipped.length > 0) {
      console.log('\n⚠️  Skipped users:');
      results.skipped.forEach(u => console.log(`  - ${u.email || u.id}: ${u.reason}`));
    }

    if (results.failed.length > 0) {
      console.log('\n❌ Failed migrations:');
      results.failed.forEach(u => console.log(`  - ${u.email}: ${u.error}`));
    }

    if (results.success.length > 0) {
      console.log('\n📧 Next Steps:');
      console.log('1. Send password reset emails to migrated users');
      console.log('2. They can use "Forgot Password" on the login page');
      console.log('3. Or you can trigger password reset emails programmatically\n');
      
      // Optional: Send password reset emails
      const sendResetEmails = process.argv.includes('--send-reset-emails');
      if (sendResetEmails) {
        console.log('Sending password reset emails...');
        for (const user of results.success) {
          if (user.email) {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
              redirectTo: 'http://localhost:5001/reset-password',
            });
            if (error) {
              console.log(`  Failed to send reset email to ${user.email}: ${error.message}`);
            } else {
              console.log(`  Sent reset email to ${user.email}`);
            }
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } else {
        console.log('💡 Tip: Run with --send-reset-emails flag to automatically send password reset emails');
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

function generateTempPassword(): string {
  // Generate a secure temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Run migration
migrateUsers()
  .then(() => {
    console.log('\n✨ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });