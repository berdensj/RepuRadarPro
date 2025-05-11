import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import * as schema from "../shared/schema";
import ws from "ws";

// Add WebSocket constructor configuration
neonConfig.webSocketConstructor = ws;

// Function to push schema to the database
async function pushSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Test connection
  try {
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log("Database connection successful:", result[0].current_time);
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }

  // Check if table exists
  try {
    console.log("Checking if crm_integrations table exists...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS crm_integrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        crm_type TEXT NOT NULL,
        api_key TEXT NOT NULL,
        trigger_event TEXT NOT NULL,
        template_id INTEGER NOT NULL REFERENCES review_templates(id) ON DELETE CASCADE,
        delay_hours INTEGER DEFAULT 2,
        active BOOLEAN DEFAULT TRUE,
        custom_endpoint TEXT,
        other_settings JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_sync TIMESTAMP,
        requests_sent INTEGER DEFAULT 0
      )
    `);
    console.log("CRM integrations table created or already exists");
  } catch (error) {
    console.error("Error creating CRM integrations table:", error);
    throw error;
  }

  console.log("Schema push completed");
  pool.end();
}

// Run the main function
pushSchema()
  .then(() => {
    console.log("Database schema push completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database schema push failed:", error);
    process.exit(1);
  });