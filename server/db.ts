import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse DATABASE_URL and configure SSL
const connectionString = process.env.DATABASE_URL;

// ALWAYS use SSL in production with rejectUnauthorized: false for self-signed certs
let poolConfig: any = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

// Always use SSL with Supabase in production
if (connectionString?.includes('supabase')) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
    // Additional SSL options for better compatibility
    require: true,
    requestCert: false
  };
  console.log("Database: SSL enabled for Supabase with rejectUnauthorized: false");
} else if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
  console.log("Database: SSL enabled for production");
} else {
  poolConfig.ssl = false;
  console.log("Database: SSL disabled (development mode)");
}

// Override with explicit SSL disable if needed
if (process.env.DATABASE_NO_SSL === 'true') {
  poolConfig.ssl = false;
  console.log("Database: SSL explicitly disabled via DATABASE_NO_SSL");
}

// Create a PostgreSQL pool for Supabase connection
const pool = new pg.Pool(poolConfig);

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.error('SSL Config:', poolConfig.ssl);
    console.error('Connection string pattern:', connectionString?.substring(0, 30) + '...');
  } else {
    console.log('✅ Database connection successful');
    release();
  }
});

export const db = drizzle(pool, { schema });
