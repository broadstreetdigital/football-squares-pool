/**
 * Pool repository - database operations for pools
 */

import { query, queryOne, execute } from '../client';
import { Pool, PoolWithOwner } from '../types';
import { generateId } from '@/lib/utils/id';

export interface CreatePoolData {
  owner_id: string;
  name: string;
  game_name: string;
  game_time: number;
  entry_fee_info?: string;
  square_price: number;
  max_squares_per_user: number;
  visibility: 'public' | 'private';
  invite_code?: string;
  invite_code_hash?: string;
  rules?: string;
  home_team: string;
  away_team: string;
}

export interface UpdatePoolData {
  name?: string;
  game_name?: string;
  game_time?: number;
  entry_fee_info?: string;
  square_price?: number;
  max_squares_per_user?: number;
  rules?: string;
  home_team?: string;
  away_team?: string;
}

export async function createPool(data: CreatePoolData): Promise<Pool> {
  const id = generateId();
  const createdAt = Date.now();

  // Create pool
  await execute(
    `INSERT INTO pools (
      id, owner_id, name, game_name, game_time, entry_fee_info,
      square_price, max_squares_per_user, visibility, invite_code, invite_code_hash,
      status, rules, home_team, away_team, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.owner_id,
      data.name,
      data.game_name,
      data.game_time,
      data.entry_fee_info || null,
      data.square_price,
      data.max_squares_per_user,
      data.visibility,
      data.invite_code || null,
      data.invite_code_hash || null,
      'open',
      data.rules || null,
      data.home_team,
      data.away_team,
      createdAt,
    ]
  );

  // Initialize 100 squares with parameterized queries
  const squareInserts: string[] = [];
  const squareParams: any[] = [];

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      squareInserts.push('(?, ?, ?, NULL, NULL, NULL, NULL)');
      squareParams.push(id, row, col);
    }
  }

  await execute(
    `INSERT INTO squares (pool_id, row, col, claimed_by_user_id, claimed_display_name, claimed_email, claimed_at)
     VALUES ${squareInserts.join(', ')}`,
    squareParams
  );

  const pool = await queryOne<Pool>('SELECT * FROM pools WHERE id = ?', [id]);
  if (!pool) {
    throw new Error('Failed to retrieve created pool');
  }

  return pool;
}

export async function findPoolById(id: string): Promise<Pool | null> {
  const pool = await queryOne<Pool>('SELECT * FROM pools WHERE id = ?', [id]);
  return pool || null;
}

export async function findPoolWithOwner(
  id: string
): Promise<PoolWithOwner | null> {
  const pool = await queryOne<PoolWithOwner>(
    `SELECT p.*, u.name as owner_name, u.email as owner_email
     FROM pools p
     JOIN users u ON p.owner_id = u.id
     WHERE p.id = ?`,
    [id]
  );

  return pool || null;
}

export async function findPoolsByOwner(ownerId: string): Promise<Pool[]> {
  return await query<Pool>(
    'SELECT * FROM pools WHERE owner_id = ? ORDER BY created_at DESC',
    [ownerId]
  );
}

export async function findPoolsByUser(userId: string): Promise<Pool[]> {
  // Pools where user has claimed at least one square
  return await query<Pool>(
    `SELECT DISTINCT p.*
     FROM pools p
     JOIN squares s ON p.id = s.pool_id
     WHERE s.claimed_by_user_id = ?
     ORDER BY p.created_at DESC`,
    [userId]
  );
}

export async function updatePool(
  id: string,
  data: UpdatePoolData
): Promise<void> {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.game_name !== undefined) {
    updates.push('game_name = ?');
    values.push(data.game_name);
  }
  if (data.game_time !== undefined) {
    updates.push('game_time = ?');
    values.push(data.game_time);
  }
  if (data.entry_fee_info !== undefined) {
    updates.push('entry_fee_info = ?');
    values.push(data.entry_fee_info);
  }
  if (data.square_price !== undefined) {
    updates.push('square_price = ?');
    values.push(data.square_price);
  }
  if (data.max_squares_per_user !== undefined) {
    updates.push('max_squares_per_user = ?');
    values.push(data.max_squares_per_user);
  }
  if (data.rules !== undefined) {
    updates.push('rules = ?');
    values.push(data.rules);
  }
  if (data.home_team !== undefined) {
    updates.push('home_team = ?');
    values.push(data.home_team);
  }
  if (data.away_team !== undefined) {
    updates.push('away_team = ?');
    values.push(data.away_team);
  }

  if (updates.length === 0) return;

  values.push(id);
  await execute(`UPDATE pools SET ${updates.join(', ')} WHERE id = ?`, values);
}

export async function updatePoolStatus(
  id: string,
  status: Pool['status']
): Promise<void> {
  await execute('UPDATE pools SET status = ? WHERE id = ?', [status, id]);
}

export async function deletePool(id: string): Promise<void> {
  await execute('DELETE FROM pools WHERE id = ?', [id]);
}

export async function getPublicPools(limit = 20, offset = 0): Promise<Pool[]> {
  return await query<Pool>(
    `SELECT * FROM pools
     WHERE visibility = 'public'
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
}
