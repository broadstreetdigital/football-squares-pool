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
    const updates: { square_price?: number; max_squares_per_user?: number } = {};
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
