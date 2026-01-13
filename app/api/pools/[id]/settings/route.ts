/**
 * PATCH /api/pools/[id]/settings
 * Update pool settings (square price, max squares per user)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById, updatePool } from '@/lib/db/repositories/pools';
import { logEvent } from '@/lib/db/repositories/events';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: poolId } = await params;
    const body = await request.json();

    // Fetch pool and verify ownership
    const pool = await findPoolById(poolId);
    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    if (pool.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Validate input
    const updates: {
      square_price?: number;
      max_squares_per_user?: number;
      home_team?: string;
      away_team?: string;
      game_time?: number;
      rules?: string | null;
    } = {};
    const changes: Record<string, any> = {};

    if (body.square_price !== undefined) {
      const price = parseFloat(body.square_price);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: 'Invalid square price' },
          { status: 400 }
        );
      }
      updates.square_price = price;
      changes.square_price = { from: pool.square_price, to: price };
    }

    if (body.max_squares_per_user !== undefined) {
      const max = parseInt(body.max_squares_per_user);
      if (isNaN(max) || max < 1 || max > 100) {
        return NextResponse.json(
          { error: 'Invalid max squares per user (must be 1-100)' },
          { status: 400 }
        );
      }
      updates.max_squares_per_user = max;
      changes.max_squares_per_user = { from: pool.max_squares_per_user, to: max };
    }

    if (body.home_team !== undefined) {
      const homeTeam = body.home_team.trim();
      if (!homeTeam) {
        return NextResponse.json(
          { error: 'Home team cannot be empty' },
          { status: 400 }
        );
      }
      updates.home_team = homeTeam;
      changes.home_team = { from: pool.home_team, to: homeTeam };
    }

    if (body.away_team !== undefined) {
      const awayTeam = body.away_team.trim();
      if (!awayTeam) {
        return NextResponse.json(
          { error: 'Away team cannot be empty' },
          { status: 400 }
        );
      }
      updates.away_team = awayTeam;
      changes.away_team = { from: pool.away_team, to: awayTeam };
    }

    if (body.game_time !== undefined) {
      const gameTime = parseInt(body.game_time);
      if (isNaN(gameTime)) {
        return NextResponse.json(
          { error: 'Invalid game time' },
          { status: 400 }
        );
      }
      updates.game_time = gameTime;
      changes.game_time = { from: pool.game_time, to: gameTime };
    }

    if (body.rules !== undefined) {
      updates.rules = body.rules || null;
      changes.rules = { from: pool.rules, to: body.rules || null };
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Update pool
    await updatePool(poolId, updates);

    // Log event
    try {
      await logEvent(poolId, session.user.id, 'pool_updated', changes);
    } catch (logError) {
      console.error('Failed to log event (non-fatal):', logError);
    }

    return NextResponse.json({
      success: true,
      updated: Object.keys(updates),
    });
  } catch (error) {
    console.error('Update pool settings error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
