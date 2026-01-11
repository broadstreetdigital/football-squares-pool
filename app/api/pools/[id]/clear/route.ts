/**
 * POST /api/pools/[id]/clear
 * Clear all claimed squares from the board
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById } from '@/lib/db/repositories/pools';
import { execute } from '@/lib/db/client';
import { logEvent } from '@/lib/db/repositories/events';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: poolId } = await params;

    // Fetch pool and verify ownership
    const pool = await findPoolById(poolId);
    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    if (pool.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Clear all claimed squares
    await execute(
      `UPDATE squares
       SET claimed_by_user_id = NULL,
           claimed_display_name = NULL,
           claimed_email = NULL,
           claimed_at = NULL
       WHERE pool_id = ?`,
      [poolId]
    );

    // Log event
    try {
      await logEvent(poolId, session.user.id, 'pool_updated', {
        action: 'board_cleared',
      });
    } catch (logError) {
      console.error('Failed to log event (non-fatal):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Board cleared successfully',
    });
  } catch (error) {
    console.error('Clear board error:', error);

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
