/**
 * PUT /api/pools/[id]/scores
 * Update scores for a pool (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById, updatePoolStatus } from '@/lib/db/repositories/pools';
import { updateScoresSchema } from '@/lib/utils/validation';
import { upsertScore } from '@/lib/db/repositories/scores';
import { logEvent } from '@/lib/db/repositories/events';

export const runtime = 'edge';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateScoresSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get pool
    const pool = await findPoolById(id);

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Check ownership
    if (pool.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check pool status
    if (pool.status !== 'numbered' && pool.status !== 'completed') {
      return NextResponse.json(
        { error: 'Pool must be randomized before entering scores' },
        { status: 400 }
      );
    }

    // Update scores
    const updatedScores = [];
    for (const score of validation.data.scores) {
      const updated = await upsertScore(
        id,
        score.bucket,
        score.home_score,
        score.away_score
      );
      updatedScores.push(updated);
    }

    // If FINAL score is entered, mark pool as completed
    const hasFinal = validation.data.scores.some((s) => s.bucket === 'FINAL');
    if (hasFinal && pool.status !== 'completed') {
      await updatePoolStatus(id, 'completed');
    }

    // Log event
    await logEvent(id, session.user.id, 'score_updated', {
      scores: validation.data.scores,
    });

    return NextResponse.json({ scores: updatedScores });
  } catch (error) {
    console.error('Update scores error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
