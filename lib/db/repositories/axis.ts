/**
 * Axis assignments repository - randomized digits for X/Y axes
 */

import { queryOne, execute } from '../client';
import { AxisAssignment } from '../types';

export async function createAxisAssignment(
  poolId: string,
  xDigits: number[],
  yDigits: number[]
): Promise<AxisAssignment> {
  const randomizedAt = Date.now();

  await execute(
    `INSERT INTO axis_assignments (pool_id, x_digits_json, y_digits_json, randomized_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(pool_id) DO UPDATE SET
       x_digits_json = excluded.x_digits_json,
       y_digits_json = excluded.y_digits_json,
       randomized_at = excluded.randomized_at`,
    [poolId, JSON.stringify(xDigits), JSON.stringify(yDigits), randomizedAt]
  );

  return {
    pool_id: poolId,
    x_digits_json: JSON.stringify(xDigits),
    y_digits_json: JSON.stringify(yDigits),
    randomized_at: randomizedAt,
  };
}

export async function getAxisAssignment(
  poolId: string
): Promise<AxisAssignment | null> {
  const axis = await queryOne<AxisAssignment>(
    'SELECT * FROM axis_assignments WHERE pool_id = ?',
    [poolId]
  );

  return axis || null;
}

export async function deleteAxisAssignment(poolId: string): Promise<void> {
  await execute('DELETE FROM axis_assignments WHERE pool_id = ?', [poolId]);
}
