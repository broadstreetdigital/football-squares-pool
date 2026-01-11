/**
 * User repository - database operations for users
 */

import { query, queryOne, execute } from '../client';
import { User, UserPublic } from '../types';
import { generateId } from '@/lib/utils/id';

export async function createUser(
  email: string,
  passwordHash: string,
  name: string,
  emailConsent: boolean
): Promise<User> {
  const id = generateId();
  const createdAt = Date.now();
  const emailConsentValue = emailConsent ? 1 : 0; // Convert boolean to SQLite integer

  await execute(
    `INSERT INTO users (id, email, password_hash, name, email_consent, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, email.toLowerCase(), passwordHash, name, emailConsentValue, createdAt]
  );

  return {
    id,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    name,
    email_consent: emailConsentValue,
    created_at: createdAt,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await queryOne<User>(
    'SELECT * FROM users WHERE email = ? COLLATE NOCASE',
    [email.toLowerCase()]
  );

  return user || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const user = await queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
  return user || null;
}

export async function getUserPublic(id: string): Promise<UserPublic | null> {
  const user = await queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);

  if (!user) return null;

  const { password_hash, ...publicUser } = user;
  return publicUser;
}

export async function updateUserName(id: string, name: string): Promise<void> {
  await execute('UPDATE users SET name = ? WHERE id = ?', [name, id]);
}

export async function deleteUser(id: string): Promise<void> {
  await execute('DELETE FROM users WHERE id = ?', [id]);
}
