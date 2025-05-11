import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// This script handles database migrations
// Run with: npx tsx scripts/migrate.ts

// Required for Neon serverless driver
neonConfig.webSocketConstructor = ws;

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set to run migrations");
  }
  
  console.log("🔄 Starting database migrations...");
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    // Run migrations from the migrations folder
    console.log("⏳ Running migrations...");
    await migrate(db, { migrationsFolder: "./migrations" });
    
    console.log("✅ Migrations completed successfully!");
    
    // Close the pool
    await pool.end();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();