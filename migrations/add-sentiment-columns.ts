import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { reviews } from "../shared/schema";

async function addSentimentColumns() {
  console.log("Adding sentiment columns to reviews table...");
  
  try {
    // Add sentiment column if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'sentiment'
        ) THEN 
          ALTER TABLE reviews 
          ADD COLUMN sentiment TEXT;
        END IF;
      END $$;
    `);
    
    // Add sentiment_score column if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'sentiment_score'
        ) THEN 
          ALTER TABLE reviews 
          ADD COLUMN sentiment_score REAL;
        END IF;
      END $$;
    `);
    
    // Add keywords column if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'keywords'
        ) THEN 
          ALTER TABLE reviews 
          ADD COLUMN keywords JSONB;
        END IF;
      END $$;
    `);

    // Update existing reviews with default sentiment values based on rating
    await db.execute(sql`
      UPDATE reviews 
      SET sentiment = 
        CASE 
          WHEN rating >= 4 THEN 'positive'
          WHEN rating >= 3 THEN 'neutral'
          ELSE 'negative'
        END
      WHERE sentiment IS NULL;
    `);

    console.log("Sentiment columns added successfully!");
  } catch (error) {
    console.error("Error adding sentiment columns:", error);
    throw error;
  }
}

// Run the migration
addSentimentColumns()
  .then(() => {
    console.log("Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });