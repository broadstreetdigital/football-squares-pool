/**
 * Squares repository - database operations for square claims
 */

import { query, queryOne, execute, transaction } from '../client';
import { Square, Pool } from '../types';

export interface ClaimSquaresData {
  pool_id: string;
  user_id: string;
  display_name: string;
  email?: string;
  squares: Array<{ row: number; col: number }>;
}

export async function getPoolSquares(poolId: string): Promise<Square[]> {
  return query<Square>(
    'SELECT * FROM squares WHERE pool_id = ? ORDER BY row, col',
    [poolId]
  );
}

export async function getSquare(
  poolId: string,
  row: number,
  col: number
): Promise<Square | null> {
  const square = queryOne<Square>(
    'SELECT * FROM squares WHERE pool_id = ? AND row = ? AND col = ?',
    [poolId, row, col]
  );

  return square || null;
}

export async function getUserSquareCount(
  poolId: string,
  userId: string
): Promise<number> {
  const result = queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM squares WHERE pool_id = ? AND claimed_by_user_id = ?',
    [poolId, userId]
  );

  return result?.count || 0;
}

export async function claimSquares(data: ClaimSquaresData): Promise<void> {
  const { pool_id, user_id, display_name, email, squares: squaresToClaim } = data;

  transaction(() => {
    // Verify pool is open
    const pool = queryOne<Pool>('SELECT status FROM pools WHERE id = ?', [
      pool_id,
    ]);

    if (!pool || pool.status !== 'open') {
      throw new Error('Pool is not open for claims');
    }

    // Check user hasn't exceeded limit
    const currentCount = getUserSquareCount(pool_id, user_id);
    const poolData = queryOne<Pool>('SELECT max_squares_per_user FROM pools WHERE id = ?', [pool_id]);

    if (!poolData) {
      throw new Error('Pool not found');
    }

    if (currentCount + squaresToClaim.length > poolData.max_squares_per_user) {
      throw new Error(
        `Would exceed max squares per user (${poolData.max_squares_per_user})`
      );
    }

    // Claim each square
    const claimedAt = Date.now();

    for (const { row, col } of squaresToClaim) {
      // Check square is unclaimed
      const existing = queryOne<Square>(
        'SELECT claimed_by_user_id FROM squares WHERE pool_id = ? AND row = ? AND col = ?',
        [pool_id, row, col]
      );

      if (existing?.claimed_by_user_id) {
        throw new Error(`Square (${row}, ${col}) is already claimed`);
      }

      // Claim it
      execute(
        `UPDATE squares
         SET claimed_by_user_id = ?,
             claimed_display_name = ?,
             claimed_email = ?,
             claimed_at = ?
         WHERE pool_id = ? AND row = ? AND col = ?`,
        [user_id, display_name, email || null, claimedAt, pool_id, row, col]
      );
    }
  });
}

export async function unclaimSquare(
  poolId: string,
  row: number,
  col: number,
  userId: string
): Promise<void> {
  transaction(() => {
    // Verify pool is open
    const pool = queryOne<Pool>('SELECT status FROM pools WHERE id = ?', [
      poolId,
    ]);

    if (!pool || pool.status !== 'open') {
      throw new Error('Pool is not open - cannot unclaim');
    }

    // Verify user owns this square
    const square = queryOne<Square>(
      'SELECT claimed_by_user_id FROM squares WHERE pool_id = ? AND row = ? AND col = ?',
      [poolId, row, col]
    );

    if (!square?.claimed_by_user_id) {
      throw new Error('Square is not claimed');
    }

    if (square.claimed_by_user_id !== userId) {
      throw new Error('You do not own this square');
    }

    // Unclaim it
    execute(
      `UPDATE squares
       SET claimed_by_user_id = NULL,
           claimed_display_name = NULL,
           claimed_email = NULL,
           claimed_at = NULL
       WHERE pool_id = ? AND row = ? AND col = ?`,
      [poolId, row, col]
    );
  });
}

export async function ownerClaimSquare(
  poolId: string,
  row: number,
  col: number,
  displayName: string,
  email?: string
): Promise<void> {
  const claimedAt = Date.now();

  // Owner can claim on behalf of others even when locked
  const square = queryOne<Square>(
    'SELECT claimed_by_user_id FROM squares WHERE pool_id = ? AND row = ? AND col = ?',
    [poolId, row, col]
  );

  if (square?.claimed_by_user_id) {
    throw new Error('Square is already claimed');
  }

  execute(
    `UPDATE squares
     SET claimed_by_user_id = NULL,
         claimed_display_name = ?,
         claimed_email = ?,
         claimed_at = ?
     WHERE pool_id = ? AND row = ? AND col = ?`,
    [displayName, email || null, claimedAt, poolId, row, col]
  );
}

export async function getUnclaimedSquares(poolId: string): Promise<Square[]> {
  return query<Square>(
    'SELECT * FROM squares WHERE pool_id = ? AND claimed_by_user_id IS NULL AND claimed_display_name IS NULL',
    [poolId]
  );
}

export async function getClaimedSquaresCount(poolId: string): Promise<number> {
  const result = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM squares
     WHERE pool_id = ? AND (claimed_by_user_id IS NOT NULL OR claimed_display_name IS NOT NULL)`,
    [poolId]
  );

  return result?.count || 0;
}
