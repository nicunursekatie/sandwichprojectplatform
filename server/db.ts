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

// Create SSL configuration based on environment
let sslConfig: any = false;

if (process.env.NODE_ENV === 'production' || connectionString?.includes('sslmode=require')) {
  // For production or when SSL is explicitly required
  sslConfig = {
    rejectUnauthorized: false,
    // Additional SSL options for compatibility
    ca: process.env.DATABASE_CA_CERT || undefined
  };
}

// Special handling for Render environment
if (process.env.RENDER) {
  sslConfig = {
    rejectUnauthorized: false
  };
}

// Create a PostgreSQL pool for Supabase connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
  // Additional connection options for stability
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

export const db = drizzle(pool, { schema });
