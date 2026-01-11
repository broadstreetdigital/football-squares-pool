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
import { getParticipantCount, getPoolParticipants } from '@/lib/db/repositories/squares';
import { sendDigitsRandomizedManagerEmail, sendDigitsRandomizedParticipantEmail } from '@/lib/email/sendgrid';


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

    // Get stats for emails (non-blocking)
    const participantCount = await getParticipantCount(id);
    const participants = await getPoolParticipants(id);

    const gameDate = new Date(pool.game_time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const randomizedTime = new Date(axis.randomized_at).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    // Send manager email (non-blocking)
    sendDigitsRandomizedManagerEmail({
      email: session.user.email,
      managerName: session.user.name,
      poolName: pool.name,
      poolId: pool.id,
      teamAName: pool.away_team || 'Away Team',
      teamBName: pool.home_team || 'Home Team',
      xDigits,
      yDigits,
      randomizedTime,
    }).catch((err) => {
      console.error('Failed to send digits randomized manager email:', err);
    });

    // Send participant emails (non-blocking)
    participants.forEach((participant) => {
      sendDigitsRandomizedParticipantEmail({
        email: participant.email,
        participantName: participant.display_name,
        poolName: pool.name,
        poolId: pool.id,
        gameDate,
        teamAName: pool.away_team || 'Away Team',
        teamBName: pool.home_team || 'Home Team',
        xDigits,
        yDigits,
        userSquareCount: participant.square_count,
        participantCount,
      }).catch((err) => {
        console.error(`Failed to send digits randomized email to ${participant.email}:`, err);
      });
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
