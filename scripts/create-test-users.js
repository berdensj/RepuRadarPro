import { db } from '../server/db.js';
import { users, locationManagers } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// Function to hash passwords
const scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  console.log('Creating test users and setting up location managers...');

  // First, get existing locations for the client user (id: 5)
  const locations = await db.query.locations.findMany({
    where: eq(locations.userId, 5)
  });

  if (locations.length < 2) {
    console.error('Error: Client user should have at least 2 locations');
    process.exit(1);
  }

  // Make the client user an admin
  await db.update(users)
    .set({ role: 'admin' })
    .where(eq(users.id, 5));
  
  console.log('Updated client user (id: 5) to admin role');

  // Create 10 test users
  const testUsers = [
    { username: 'manager1', email: 'manager1@example.com', fullName: 'Location Manager 1', role: 'manager' },
    { username: 'manager2', email: 'manager2@example.com', fullName: 'Location Manager 2', role: 'manager' },
    { username: 'staff1', email: 'staff1@example.com', fullName: 'Staff Member 1', role: 'staff' },
    { username: 'staff2', email: 'staff2@example.com', fullName: 'Staff Member 2', role: 'staff' },
    { username: 'user1', email: 'user1@example.com', fullName: 'Regular User 1', role: 'user' },
    { username: 'user2', email: 'user2@example.com', fullName: 'Regular User 2', role: 'user' },
    { username: 'user3', email: 'user3@example.com', fullName: 'Regular User 3', role: 'user' },
    { username: 'user4', email: 'user4@example.com', fullName: 'Regular User 4', role: 'user' },
    { username: 'user5', email: 'user5@example.com', fullName: 'Regular User 5', role: 'user' },
    { username: 'user6', email: 'user6@example.com', fullName: 'Regular User 6', role: 'user' },
  ];

  const defaultPassword = await hashPassword('password123');
  
  // Add all users
  for (const user of testUsers) {
    try {
      await db.insert(users).values({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        password: defaultPassword,
        role: user.role,
        businessName: 'Test Client Company',
        industry: 'Technology',
        plan: 'Basic',
        subscriptionStatus: 'active',
        onboardingCompleted: true
      });
      console.log(`Created user: ${user.username} (${user.role})`);
    } catch (err) {
      console.error(`Error creating user ${user.username}:`, err.message);
    }
  }

  // Get IDs of created manager users
  const manager1 = await db.query.users.findFirst({
    where: eq(users.username, 'manager1')
  });

  const manager2 = await db.query.users.findFirst({
    where: eq(users.username, 'manager2')
  });

  if (!manager1 || !manager2) {
    console.error('Error: Could not find manager users');
    process.exit(1);
  }

  // Assign managers to locations
  await db.insert(locationManagers).values({
    userId: manager1.id,
    locationId: locations[0].id
  });
  console.log(`Assigned manager1 (id: ${manager1.id}) to location: ${locations[0].name} (id: ${locations[0].id})`);

  await db.insert(locationManagers).values({
    userId: manager2.id,
    locationId: locations[1].id
  });
  console.log(`Assigned manager2 (id: ${manager2.id}) to location: ${locations[1].name} (id: ${locations[1].id})`);

  console.log('\nSetup complete!');
  console.log('\nTest Users:');
  console.log('- client (admin) - password: client123');
  console.log('- manager1 (location manager for Downtown Office) - password: password123');
  console.log('- manager2 (location manager for Uptown Branch) - password: password123');
  console.log('- staff1, staff2 (staff members) - password: password123');
  console.log('- user1 through user6 (regular users) - password: password123');

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});