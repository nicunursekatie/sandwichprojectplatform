import * as dotenv from 'dotenv';
dotenv.config();

// Set DATABASE_URL before importing db
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:Sandwich%21Project1328@db.mifquzfaqtcyboqntfyn.supabase.co:6543/postgres';

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { sandwichCollections, users } from '../shared/schema';
import { sql } from 'drizzle-orm';

const client = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(client);

async function checkData() {
  console.log('Checking database data...\n');
  
  try {
    // Check sandwich collections
    const collectionsCount = await db.select({ count: sql<number>`count(*)` })
      .from(sandwichCollections);
    console.log('Sandwich Collections:', collectionsCount[0].count);
    
    // Check users
    const usersCount = await db.select({ count: sql<number>`count(*)` })
      .from(users);
    console.log('Users in local DB:', usersCount[0].count);
    
    // Get sample collections
    const sampleCollections = await db.select()
      .from(sandwichCollections)
      .limit(3);
    console.log('\nSample collections:', sampleCollections.length > 0 ? sampleCollections : 'No collections found');
    
  } catch (error) {
    console.error('Error checking data:', error);
  }
  
  await client.end();
  process.exit(0);
}

checkData();