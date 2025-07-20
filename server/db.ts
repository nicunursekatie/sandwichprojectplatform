import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not set. Some functionality may be limited.");
  console.log("In Replit, make sure to:");
  console.log("1. Go to the Database tab");
  console.log("2. Create a PostgreSQL database");
  console.log("3. Copy the connection string to DATABASE_URL in Secrets");
  
  // For development, we'll use a placeholder that won't crash the server
  // but will log warnings when database operations are attempted
  process.env.DATABASE_URL = "postgresql://placeholder:placeholder@placeholder:5432/placeholder";
}

// Use HTTP connection instead of WebSocket for better stability
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
