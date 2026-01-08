/**
 * Turso (libSQL) Database Client
 * Works with edge runtime and requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
 */

import { createClient } from '@libsql/client/web';

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error(
        'TURSO_DATABASE_URL environment variable is required. ' +
        'Get it from https://turso.tech after creating a database.'
      );
    }

    client = createClient({
      url,
      authToken, // Optional for local development
    });
  }

  return client;
}

/**
 * Execute a query with parameters
 * Returns all matching rows
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const client = getClient();
  const result = await client.execute({ sql, args: params });
  return result.rows as T[];
}

/**
 * Execute a query and return first row
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const client = getClient();
  const result = await client.execute({ sql, args: params });
  return result.rows[0] as T | undefined;
}

/**
 * Execute a mutation (INSERT, UPDATE, DELETE)
 * Returns { changes, lastInsertRowid }
 */
export async function execute(
  sql: string,
  params: any[] = []
): Promise<{ changes: number; lastInsertRowid: number }> {
  const client = getClient();
  const result = await client.execute({ sql, args: params });

  return {
    changes: result.rowsAffected,
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

/**
 * Execute multiple statements in a transaction
 */
export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  const client = getClient();

  await client.execute('BEGIN IMMEDIATE');

  try {
    const result = await fn();
    await client.execute('COMMIT');
    return result;
  } catch (error) {
    await client.execute('ROLLBACK');
    throw error;
  }
}

/**
 * Initialize database schema
 * Safe to call multiple times (uses IF NOT EXISTS)
 */
export async function initializeSchema(schemaSql: string): Promise<void> {
  const client = getClient();

  // Split schema into individual statements
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await client.execute(statement);
  }
}
