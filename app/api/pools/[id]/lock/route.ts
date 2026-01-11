/**
 * POST /api/pools/[id]/lock
 * Lock the pool (owner only) - prevents new square claims
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById, updatePoolStatus } from '@/lib/db/repositories/pools';
import { logEvent } from '@/lib/db/repositories/events';
import { getClaimedSquaresCount, getParticipantCount, getPoolParticipants } from '@/lib/db/repositories/squares';
import { sendBoardLockedManagerEmail, sendBoardLockedParticipantEmail } from '@/lib/email/sendgrid';


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

    // Get stats for emails (non-blocking)
    const claimedSquares = await getClaimedSquaresCount(id);
    const participantCount = await getParticipantCount(id);
    const participants = await getPoolParticipants(id);

    // Send manager email (non-blocking)
    sendBoardLockedManagerEmail({
      email: session.user.email,
      managerName: session.user.name,
      poolName: pool.name,
      poolId: pool.id,
      claimedSquares,
      participantCount,
    }).catch((err) => {
      console.error('Failed to send board locked manager email:', err);
    });

    // Send participant emails (non-blocking)
    const gameDate = new Date(pool.game_time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    participants.forEach((participant) => {
      sendBoardLockedParticipantEmail({
        email: participant.email,
        participantName: participant.display_name,
        poolName: pool.name,
        poolId: pool.id,
        gameDate,
        userSquareCount: participant.square_count,
        participantCount,
      }).catch((err) => {
        console.error(`Failed to send board locked email to ${participant.email}:`, err);
      });
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
