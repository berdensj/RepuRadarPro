import { db, pool } from "../server/db";

async function addAiRepliedColumn() {
  console.log("Adding ai_replied column to reviews table...");
  
  try {
    // SQL query to add the ai_replied column if it doesn't exist
    await pool.query(`
      ALTER TABLE reviews
      ADD COLUMN IF NOT EXISTS ai_replied BOOLEAN DEFAULT FALSE
    `);
    
    console.log("ai_replied column added successfully!");
  } catch (error) {
    console.error("Error adding ai_replied column:", error);
    throw error;
  }
}

async function runMigration() {
  try {
    await addAiRepliedColumn();
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();