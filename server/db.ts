import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse DATABASE_URL to check if it includes SSL parameters
const connectionString = process.env.DATABASE_URL;
const isSSLRequired = connectionString?.includes('sslmode=require') || 
                      process.env.NODE_ENV === 'production';

// Create a PostgreSQL pool for Supabase connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isSSLRequired && {
    ssl: {
      rejectUnauthorized: false
    }
  })
});

export const db = drizzle(pool, { schema });
