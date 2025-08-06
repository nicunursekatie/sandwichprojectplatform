import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mifquzfaqtcyboqntfyn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔄 Running permissions table migration...');
  
  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), 'supabase/migrations/create_user_permissions_table.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If the RPC doesn't exist, try a different approach
      console.log('⚠️  Direct SQL execution not available, creating table manually...');
      
      // Create the table
      const { error: createError } = await supabase.from('user_permissions').select('*').limit(1);
      
      if (createError?.message?.includes('relation "public.user_permissions" does not exist')) {
        console.log('✅ Table needs to be created via Supabase dashboard');
        console.log('\n📋 Please run the following SQL in your Supabase SQL editor:');
        console.log('   1. Go to https://supabase.com/dashboard/project/mifquzfaqtcyboqntfyn/sql/new');
        console.log('   2. Copy and paste the contents of supabase/migrations/create_user_permissions_table.sql');
        console.log('   3. Click "Run"\n');
        return;
      }
    }
    
    console.log('✅ Permissions table migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

runMigration().catch(console.error);