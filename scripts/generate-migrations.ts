import { exec } from "child_process";
import { promisify } from "util";
import { resolve } from "path";

const execAsync = promisify(exec);

// This script generates migrations by comparing the current schema with the database
// Run with: npx tsx scripts/generate-migrations.ts

async function generateMigrations() {
  try {
    console.log("🔄 Generating database migrations...");
    
    const drizzleKitPath = resolve("./node_modules/.bin/drizzle-kit");
    
    // Run drizzle-kit generate to create migration files
    const { stdout, stderr } = await execAsync(
      `${drizzleKitPath} generate:pg --schema=./shared/schema.ts`
    );
    
    if (stderr) {
      console.error("⚠️ Warnings during migration generation:", stderr);
    }
    
    console.log("✅ Migration generation output:", stdout);
    console.log("✅ Migrations generated successfully!");
    
  } catch (error) {
    console.error("❌ Migration generation failed:", error);
    process.exit(1);
  }
}

generateMigrations();