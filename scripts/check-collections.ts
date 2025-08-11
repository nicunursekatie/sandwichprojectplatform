import * as dotenv from 'dotenv';
dotenv.config();

// Set DATABASE_URL before importing db
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:Sandwich%21Project1328@db.mifquzfaqtcyboqntfyn.supabase.co:6543/postgres';

// Disable SSL verification for this script
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sandwichCollections } from '../shared/schema';
import { sql } from 'drizzle-orm';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false
  }
});

const db = drizzle(pool);

async function checkCollections() {
  console.log('Checking sandwich collections...\n');
  
  try {
    // Count collections
    const countResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(sandwichCollections);
    console.log('Total collections in database:', countResult[0].count);
    
    // Get sample collections
    const samples = await db.select()
      .from(sandwichCollections)
      .limit(5);
    
    if (samples.length > 0) {
      console.log('\nSample collections:');
      samples.forEach((sample, i) => {
        console.log(`${i + 1}. Host: ${sample.hostName}, Date: ${sample.collectionDate}, Sandwiches: ${sample.individualSandwiches}`);
      });
    } else {
      console.log('\nNo collections found in database.');
      console.log('\nWould you like to insert sample data? This would help test the application.');
    }
    
    // Check table structure
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sandwich_collections' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\nTable columns:');
    tableInfo.rows.forEach((row: any) => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error checking collections:', error);
  } finally {
    await pool.end();
  }
}

checkCollections();