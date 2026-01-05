/**
 * POST /api/pools/[id]/randomize
 * Randomize board digits (owner only) - must be locked first
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById, updatePoolStatus } from '@/lib/db/repositories/pools';
import { createAxisAssignment } from '@/lib/db/repositories/axis';
import { logEvent } from '@/lib/db/repositories/events';
import { generateRandomDigits } from '@/lib/game/randomize';

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
    if (pool.status !== 'locked') {
      return NextResponse.json(
        { error: 'Pool must be locked before randomization' },
        { status: 400 }
      );
    }

    // Generate random digits
    const xDigits = generateRandomDigits();
    const yDigits = generateRandomDigits();

    // Save axis assignment
    const axis = await createAxisAssignment(id, xDigits, yDigits);

    // Update pool status to numbered
    await updatePoolStatus(id, 'numbered');

    // Log event
    await logEvent(id, session.user.id, 'pool_randomized', {
      x_digits: xDigits,
      y_digits: yDigits,
    });

    return NextResponse.json({
      axis: {
        pool_id: axis.pool_id,
        x_digits: xDigits,
        y_digits: yDigits,
        randomized_at: axis.randomized_at,
      },
    });
  } catch (error) {
    console.error('Randomize pool error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
