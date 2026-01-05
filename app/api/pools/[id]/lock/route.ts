/**
 * POST /api/pools/[id]/lock
 * Lock the pool (owner only) - prevents new square claims
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById, updatePoolStatus } from '@/lib/db/repositories/pools';
import { logEvent } from '@/lib/db/repositories/events';

export const runtime = 'edge';

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

    // Check current status
    if (pool.status !== 'open') {
      return NextResponse.json(
        { error: 'Pool is already locked' },
        { status: 400 }
      );
    }

    // Lock the pool
    await updatePoolStatus(id, 'locked');

    // Log event
    await logEvent(id, session.user.id, 'pool_locked', {
      pool_name: pool.name,
    });

    // Return updated pool
    const updated = await findPoolById(id);
    return NextResponse.json({ pool: updated });
  } catch (error) {
    console.error('Lock pool error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
