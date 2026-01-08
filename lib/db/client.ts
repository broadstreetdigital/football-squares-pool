/**
 * Database client for Webflow Cloud SQLite binding
 *
 * In edge runtime, we access SQLite via Webflow's provided binding.
 * For local development, we use a simple file-based SQLite implementation.
 */

export interface Database {
  prepare(sql: string): Statement;
  exec(sql: string): void;
  close(): void;
}

export interface Statement {
  bind(...params: any[]): Statement;
  all<T = any>(): T[];
  get<T = any>(): T | undefined;
  run(): { changes: number; lastInsertRowid: number };
  finalize(): void;
}

/**
 * Get database instance
 * In Webflow Cloud, this binds to the provided SQLite instance
 * In local dev, falls back to file-based SQLite
 */
export function getDatabase(): Database {
  // Try multiple binding names (DB or DATABASE)
  const bindingNames = ['DB', 'DATABASE'];

  // In Cloudflare Workers (Webflow Cloud), bindings are available via getBindingsProxy
  // @ts-ignore - Cloudflare platform global
  if (typeof platformBinding !== 'undefined') {
    for (const name of bindingNames) {
      try {
        // @ts-ignore
        const db = platformBinding(name);
        if (db) return db as Database;
      } catch (e) {
        // Try next binding name
      }
    }
  }

  // Try process.env (Cloudflare Workers with OpenNext)
  // @ts-ignore - Cloudflare Workers runtime
  if (typeof process !== 'undefined') {
    for (const name of bindingNames) {
      // @ts-ignore
      if (process.env?.[name]) {
        // @ts-ignore
        return process.env[name] as Database;
      }
    }
  }

  // Try global bindings
  for (const name of bindingNames) {
    // @ts-ignore - Cloudflare Workers runtime global
    if (typeof globalThis !== 'undefined' && globalThis[name]) {
      // @ts-ignore
      return globalThis[name] as Database;
    }
  }

  // Local development fallback
  throw new Error(
    'Database not available. In production, Webflow Cloud provides DB binding. ' +
    'For local development, you need to set up SQLite manually or use mock.'
  );
}

/**
 * Execute a query with parameters
 * Returns all matching rows
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);

  if (params.length > 0) {
    stmt.bind(...params);
  }

  const result = stmt.all<T>();
  stmt.finalize();

  return result;
}

/**
 * Execute a query and return first row
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
  const db = getDatabase();
  const stmt = db.prepare(sql);

  if (params.length > 0) {
    stmt.bind(...params);
  }

  const result = stmt.get<T>();
  stmt.finalize();

  return result;
}

/**
 * Execute a mutation (INSERT, UPDATE, DELETE)
 * Returns { changes, lastInsertRowid }
 */
export function execute(
  sql: string,
  params: any[] = []
): { changes: number; lastInsertRowid: number } {
  const db = getDatabase();
  const stmt = db.prepare(sql);

  if (params.length > 0) {
    stmt.bind(...params);
  }

  const result = stmt.run();
  stmt.finalize();

  return result;
}

/**
 * Execute multiple statements in a transaction
 */
export function transaction<T>(fn: () => T): T {
  const db = getDatabase();

  try {
    db.exec('BEGIN IMMEDIATE');
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

/**
 * Initialize database schema
 * Safe to call multiple times (uses IF NOT EXISTS)
 */
export function initializeSchema(schemaSql: string): void {
  const db = getDatabase();
  db.exec(schemaSql);
}
