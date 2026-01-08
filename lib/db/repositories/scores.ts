/**
 * Scores repository - quarter and final scores
 */

import { query, queryOne, execute } from '../client';
import { Score } from '../types';

export async function upsertScore(
  poolId: string,
  bucket: Score['bucket'],
  homeScore: number,
  awayScore: number
): Promise<Score> {
  const updatedAt = Date.now();

  await execute(
    `INSERT INTO scores (pool_id, bucket, home_score, away_score, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(pool_id, bucket) DO UPDATE SET
       home_score = excluded.home_score,
       away_score = excluded.away_score,
       updated_at = excluded.updated_at`,
    [poolId, bucket, homeScore, awayScore, updatedAt]
  );

  return {
    pool_id: poolId,
    bucket,
    home_score: homeScore,
    away_score: awayScore,
    updated_at: updatedAt,
  };
}

export async function getPoolScores(poolId: string): Promise<Score[]> {
  return await query<Score>(
    `SELECT * FROM scores WHERE pool_id = ?
     ORDER BY
       CASE bucket
         WHEN 'Q1' THEN 1
         WHEN 'Q2' THEN 2
         WHEN 'Q3' THEN 3
         WHEN 'Q4' THEN 4
         WHEN 'FINAL' THEN 5
       END`,
    [poolId]
  );
}

export async function getScore(
  poolId: string,
  bucket: Score['bucket']
): Promise<Score | null> {
  const score = await queryOne<Score>(
    'SELECT * FROM scores WHERE pool_id = ? AND bucket = ?',
    [poolId, bucket]
  );

  return score || null;
}

export async function deletePoolScores(poolId: string): Promise<void> {
  await execute('DELETE FROM scores WHERE pool_id = ?', [poolId]);
}
