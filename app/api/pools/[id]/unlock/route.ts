/**
 * POST /api/pools/[id]/unlock
 * Unlock the pool (owner only) - reopens for square claims
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById, updatePoolStatus } from '@/lib/db/repositories/pools';
import { logEvent } from '@/lib/db/repositories/events';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get pool
    const pool = await findPoolById(id);

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Check ownership
    if (pool.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check current status - can only unlock from 'locked' state
    if (pool.status !== 'locked') {
      return NextResponse.json(
        { error: 'Pool must be in locked state to unlock' },
        { status: 400 }
      );
    }

    // Unlock the pool - return to open state
    await updatePoolStatus(id, 'open');

    // Log event
    await logEvent(id, session.user.id, 'pool_unlocked', {
      pool_name: pool.name,
    });

    // Return updated pool
    const updated = await findPoolById(id);
    return NextResponse.json({ pool: updated });
  } catch (error) {
    console.error('Unlock pool error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
