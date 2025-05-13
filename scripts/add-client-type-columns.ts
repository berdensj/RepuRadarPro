import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addClientTypeColumns() {
  console.log("Adding client type columns to users table...");
  
  try {
    // Add client_type column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS client_type TEXT,
      ADD COLUMN IF NOT EXISTS client_type_custom TEXT,
      ADD COLUMN IF NOT EXISTS is_agency BOOLEAN NOT NULL DEFAULT false
    `);

    console.log("Columns added successfully.");
  } catch (error) {
    console.error("Error adding columns:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

addClientTypeColumns();