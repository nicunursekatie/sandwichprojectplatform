import { Router } from "express";
import { db } from "../db";
import { sandwichCollections } from "../../shared/schema";
import { sql } from "drizzle-orm";

const router = Router();

// Test database connection and collections query
router.get("/test-db", async (req, res) => {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Simple count query
    console.log('Test 1: Counting collections...');
    const countResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(sandwichCollections);
    const count = countResult[0].count;
    console.log(`Found ${count} collections`);
    
    // Test 2: Get first 5 collections
    console.log('Test 2: Fetching sample collections...');
    const samples = await db.select()
      .from(sandwichCollections)
      .limit(5);
    console.log(`Retrieved ${samples.length} sample collections`);
    
    res.json({
      success: true,
      totalCollections: count,
      sampleCount: samples.length,
      samples: samples.map(s => ({
        id: s.id,
        hostName: s.hostName,
        date: s.collectionDate,
        sandwiches: s.individualSandwiches
      }))
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

export { router as testDbRoutes };