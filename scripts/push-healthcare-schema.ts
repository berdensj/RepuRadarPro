import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../server/db';

async function pushSchema() {
  try {
    console.log('Pushing database schema...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "healthcare_settings" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "enable_review_automation" BOOLEAN DEFAULT false,
        "request_delay" TEXT DEFAULT 'immediately',
        "default_template_id" INTEGER,
        "google_profile_link" TEXT,
        "use_patient_terminology" BOOLEAN DEFAULT true,
        "hipaa_mode" BOOLEAN DEFAULT true,
        "drchrono_enabled" BOOLEAN DEFAULT false,
        "drchrono_client_id" TEXT,
        "drchrono_client_secret" TEXT,
        "drchrono_refresh_token" TEXT,
        "janeapp_enabled" BOOLEAN DEFAULT false,
        "janeapp_api_key" TEXT,
        "janeapp_api_secret" TEXT,
        "primary_location_id" INTEGER,
        "auto_send_review_requests" BOOLEAN DEFAULT true,
        "default_review_platform" TEXT DEFAULT 'google',
        "last_polled_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "patients" (
        "id" VARCHAR(255) PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "location_id" INTEGER REFERENCES "locations"("id"),
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255),
        "phone" VARCHAR(50),
        "ehr_id" VARCHAR(255),
        "ehr_source" VARCHAR(50) NOT NULL,
        "last_appointment" TIMESTAMP,
        "review_request_sent" TIMESTAMP,
        "review_completed" BOOLEAN DEFAULT false,
        "review_completed_at" TIMESTAMP,
        "review_platform" VARCHAR(50),
        "rating" INTEGER,
        "review_id" INTEGER REFERENCES "reviews"("id"),
        "metadata" JSONB,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Schema push completed successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
    process.exit(1);
  }
}

pushSchema()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error in push script:', error);
    process.exit(1);
  });