import { db } from '../server/db.js';

async function addLocationManagersTable() {
  console.log('Adding location_managers table...');

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS location_managers (
        id SERIAL PRIMARY KEY NOT NULL,
        user_id INTEGER NOT NULL,
        location_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
    `);
    
    console.log('Table location_managers created successfully');
  } catch (error) {
    console.error('Error creating location_managers table:', error);
    throw error;
  }
}

// Run the function
addLocationManagersTable()
  .then(() => {
    console.log('Migration completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });