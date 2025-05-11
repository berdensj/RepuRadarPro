#!/usr/bin/env node

// A simple script to make a user an admin
import fetch from 'node-fetch';

async function login() {
  const loginResponse = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'berdensj',  // Use the username of an existing user
      password: 'password123'
    }),
    credentials: 'include'
  });

  if (!loginResponse.ok) {
    throw new Error(`Login failed with status ${loginResponse.status}`);
  }

  const userData = await loginResponse.json();
  console.log('Logged in as:', userData.username);
  return userData;
}

async function makeAdmin(userId) {
  const response = await fetch('http://localhost:5000/api/dev/make-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to make user admin: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('User updated:', result);
  return result;
}

async function main() {
  try {
    const user = await login();
    console.log('Making user an admin:', user.id);
    await makeAdmin(user.id);
    console.log('Success! User is now an admin.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();