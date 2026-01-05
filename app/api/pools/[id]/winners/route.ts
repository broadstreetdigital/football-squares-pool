/**
 * GET /api/pools/[id]/winners
 * Calculate and return winners for all quarters
 */

import { NextRequest, NextResponse } from 'next/server';
import { findPoolById } from '@/lib/db/repositories/pools';
import { getPoolSquares } from '@/lib/db/repositories/squares';
import { getAxisAssignment } from '@/lib/db/repositories/axis';
import { getPoolScores } from '@/lib/db/repositories/scores';
import { calculateAllWinners } from '@/lib/game/winners';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get pool
    const pool = await findPoolById(id);

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Check pool status
    if (pool.status !== 'numbered' && pool.status !== 'completed') {
      return NextResponse.json(
        { error: 'Pool must be randomized before calculating winners' },
        { status: 400 }
      );
    }

    // Get data
    const axis = await getAxisAssignment(id);
    const scores = await getPoolScores(id);
    const squares = await getPoolSquares(id);

    if (!axis) {
      return NextResponse.json(
        { error: 'Pool axis not randomized' },
        { status: 400 }
      );
    }

    if (scores.length === 0) {
      return NextResponse.json({ winners: [] });
    }

    // Parse axis digits
    const xDigits = JSON.parse(axis.x_digits_json);
    const yDigits = JSON.parse(axis.y_digits_json);

    // Calculate winners
    const winners = calculateAllWinners(scores, xDigits, yDigits, squares);

    return NextResponse.json({ winners });
  } catch (error) {
    console.error('Get winners error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
