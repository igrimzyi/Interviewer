import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(value) {
  return bcrypt.hash(value, SALT_ROUNDS);
}

export async function comparePassword(value, hash) {
  return bcrypt.compare(value, hash);
}