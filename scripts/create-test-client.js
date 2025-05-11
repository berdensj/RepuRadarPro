// Script to create a test client account
import pg from 'pg';
import crypto from 'crypto';
import { promisify } from 'util';

const { Pool } = pg;
const { scrypt, randomBytes } = crypto;

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Check if client user already exists
    const checkResult = await pool.query('SELECT * FROM users WHERE username = $1', ['client']);
    
    if (checkResult.rows.length > 0) {
      console.log('Client test account already exists');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await hashPassword('client123');
    
    // Create client user
    const insertUserResult = await pool.query(
      'INSERT INTO users (username, password, email, "fullName", role, "isActive", "createdAt", "profilePicture", "companyLogo", plan) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      ['client', hashedPassword, 'client@example.com', 'Test Client', 'user', true, new Date(), null, null, 'premium']
    );
    
    const userId = insertUserResult.rows[0].id;
    console.log(`Created client user with ID: ${userId}`);
    
    // Create locations for the client
    const downtownLocationResult = await pool.query(
      'INSERT INTO locations (name, "userId", address, phone, website, type, "isActive") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      ['Downtown Office', userId, '123 Main St, Downtown, NY 10001', '555-123-4567', 'https://example.com/downtown', 'office', true]
    );
    
    const uptownLocationResult = await pool.query(
      'INSERT INTO locations (name, "userId", address, phone, website, type, "isActive") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      ['Uptown Branch', userId, '456 Park Ave, Uptown, NY 10022', '555-987-6543', 'https://example.com/uptown', 'branch', true]
    );
    
    const downtownLocationId = downtownLocationResult.rows[0].id;
    const uptownLocationId = uptownLocationResult.rows[0].id;
    
    console.log(`Created downtown location with ID: ${downtownLocationId}`);
    console.log(`Created uptown location with ID: ${uptownLocationId}`);
    
    // Add reviews for downtown location
    await pool.query(
      'INSERT INTO reviews ("userId", "locationId", "customerName", rating, title, content, platform, date, "isResolved", response, "sentimentScore") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [userId, downtownLocationId, 'John Smith', 5, 'Excellent service!', 'The team at the downtown office was extremely helpful and professional. Highly recommended!', 'Google', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), true, 'Thank you for your kind words, John! We\'re glad we could help you.', 0.9]
    );
    
    await pool.query(
      'INSERT INTO reviews ("userId", "locationId", "customerName", rating, title, content, platform, date, "isResolved", response, "sentimentScore") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [userId, downtownLocationId, 'Sarah Johnson', 4, 'Good experience overall', 'I had a good experience at the downtown office. The staff was helpful, although I had to wait a bit longer than expected.', 'Yelp', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), true, 'Thanks for the feedback, Sarah. We appreciate your patience and will work on improving our wait times.', 0.7]
    );
    
    await pool.query(
      'INSERT INTO reviews ("userId", "locationId", "customerName", rating, title, content, platform, date, "isResolved", response, "sentimentScore") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [userId, downtownLocationId, 'Mike Thompson', 2, 'Disappointed with service', 'Long wait times and staff seemed disorganized. Expected better service based on the reviews.', 'Google', new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), true, 'We\'re sorry to hear about your experience, Mike. We\'d like to make it right - please contact our office manager to discuss further.', 0.2]
    );
    
    // Add reviews for uptown location
    await pool.query(
      'INSERT INTO reviews ("userId", "locationId", "customerName", rating, title, content, platform, date, "isResolved", response, "sentimentScore") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [userId, uptownLocationId, 'Emily Davis', 5, 'Fantastic experience', 'The uptown branch team was amazing! They went above and beyond to help me with my issue.', 'Google', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), true, 'Thank you for the wonderful review, Emily! We\'re delighted to have been able to help you.', 0.95]
    );
    
    await pool.query(
      'INSERT INTO reviews ("userId", "locationId", "customerName", rating, title, content, platform, date, "isResolved", response, "sentimentScore") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [userId, uptownLocationId, 'Robert Wilson', 3, 'Average service', 'The service was okay but nothing special. Staff was polite but seemed rushed.', 'Facebook', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), false, null, 0.5]
    );
    
    await pool.query(
      'INSERT INTO reviews ("userId", "locationId", "customerName", rating, title, content, platform, date, "isResolved", response, "sentimentScore") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [userId, uptownLocationId, 'Jessica Brown', 4, 'Good service', 'I\'ve been coming to this location for years. The service is consistently good.', 'Yelp', new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), true, 'Thank you for being a loyal customer, Jessica! We value your continued trust in our services.', 0.8]
    );
    
    // Create metrics for the client
    await pool.query(
      'INSERT INTO metrics ("userId", date, "averageRating", "totalReviews", "positivePercentage", "keywordTrends") VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, new Date(), 3.83, 6, 66.7, JSON.stringify({
        "service": 6,
        "staff": 4,
        "helpful": 3,
        "professional": 2,
        "wait": 2
      })]
    );
    
    console.log('Successfully created test client account with 2 locations and 6 reviews');
    console.log('Login with username: client, password: client123');
    
  } catch (error) {
    console.error('Error creating test client account:', error);
  } finally {
    await pool.end();
  }
}

main();