/**
 * GET /api/pools/[id] - Get pool details
 * PATCH /api/pools/[id] - Update pool (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAuth } from '@/lib/auth/session';
import {
  findPoolById,
  updatePool,
  findPoolWithOwner,
} from '@/lib/db/repositories/pools';
import { updatePoolSchema } from '@/lib/utils/validation';
import { logEvent } from '@/lib/db/repositories/events';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const pool = await findPoolWithOwner(id);

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Check visibility
    if (pool.visibility === 'private' && pool.owner_id !== session?.user.id) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    return NextResponse.json({ pool });
  } catch (error) {
    console.error('Get pool error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updatePoolSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check ownership
    const pool = await findPoolById(id);
    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    if (pool.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow updates when pool is open
    if (pool.status !== 'open') {
      return NextResponse.json(
        { error: 'Cannot update pool after it is locked' },
        { status: 400 }
      );
    }

    // Update pool
    await updatePool(id, validation.data);

    // Log event
    await logEvent(id, session.user.id, 'pool_updated', validation.data);

    // Return updated pool
    const updated = await findPoolById(id);
    return NextResponse.json({ pool: updated });
  } catch (error) {
    console.error('Update pool error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
