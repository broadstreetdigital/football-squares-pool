/**
 * POST /api/pools/[id]/unrandomize
 * Remove randomization and return to locked state (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById, updatePoolStatus } from '@/lib/db/repositories/pools';
import { deleteAxisAssignment } from '@/lib/db/repositories/axis';
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

    // Check current status - can only un-randomize from 'numbered' state
    if (pool.status !== 'numbered') {
      return NextResponse.json(
        { error: 'Pool must be in numbered state to un-randomize' },
        { status: 400 }
      );
    }

    // Delete axis assignment
    await deleteAxisAssignment(id);

    // Return pool to locked state
    await updatePoolStatus(id, 'locked');

    // Log event
    await logEvent(id, session.user.id, 'pool_unrandomized', {
      pool_name: pool.name,
    });

    // Return updated pool
    const updated = await findPoolById(id);
    return NextResponse.json({ pool: updated });
  } catch (error) {
    console.error('Un-randomize pool error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
