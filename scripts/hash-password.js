import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword() {
  const password = 'testpassword';
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  console.log(buf.toString('hex') + '.' + salt);
}

hashPassword();