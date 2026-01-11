/**
 * GET /api/cron/auto-lock-pools
 * Automatically lock and randomize pools when game time is reached
 * This endpoint should be called by a cron job (e.g., Vercel Cron)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db/client';
import { Pool } from '@/lib/db/types';
import { logEvent } from '@/lib/db/repositories/events';
import { randomizeAxis } from '@/lib/game/randomize';

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();

    // Find pools that:
    // 1. Are still in 'open' or 'locked' status (not yet numbered)
    // 2. Have a game_time that has passed
    const poolsToProcess = await query<Pool>(
      `SELECT * FROM pools
       WHERE status IN ('open', 'locked')
       AND game_time <= ?`,
      [now]
    );

    const results = [];

    for (const pool of poolsToProcess) {
      try {
        // If pool is open, lock it first
        if (pool.status === 'open') {
          await execute(
            'UPDATE pools SET status = ? WHERE id = ?',
            ['locked', pool.id]
          );

          await logEvent(pool.id, null, 'pool_locked', {
            auto_locked: true,
            reason: 'Game time reached',
          });

          results.push({
            pool_id: pool.id,
            action: 'locked',
            success: true,
          });
        }

        // Now randomize the digits
        const digits = randomizeAxis();

        await execute(
          `INSERT INTO axis_assignments (pool_id, x_digits_json, y_digits_json, randomized_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(pool_id) DO UPDATE SET
             x_digits_json = excluded.x_digits_json,
             y_digits_json = excluded.y_digits_json,
             randomized_at = excluded.randomized_at`,
          [pool.id, JSON.stringify(digits), JSON.stringify(digits), now]
        );

        await execute(
          'UPDATE pools SET status = ? WHERE id = ?',
          ['numbered', pool.id]
        );

        await logEvent(pool.id, null, 'pool_randomized', {
          auto_randomized: true,
          reason: 'Game time reached',
          x_digits: digits,
          y_digits: digits,
        });

        results.push({
          pool_id: pool.id,
          action: 'randomized',
          success: true,
        });
      } catch (error) {
        console.error(`Failed to process pool ${pool.id}:`, error);
        results.push({
          pool_id: pool.id,
          action: 'failed',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: poolsToProcess.length,
      results,
      timestamp: now,
    });
  } catch (error) {
    console.error('Auto-lock cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
