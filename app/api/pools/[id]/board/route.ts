/**
 * GET /api/pools/[id]/board
 * Get complete board state (pool, squares, axis, scores)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { findPoolById } from '@/lib/db/repositories/pools';
import { getPoolSquares, getUserSquareCount } from '@/lib/db/repositories/squares';
import { getAxisAssignment } from '@/lib/db/repositories/axis';
import { getPoolScores } from '@/lib/db/repositories/scores';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    // Get pool
    const pool = await findPoolById(id);

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Check visibility
    if (pool.visibility === 'private' && pool.owner_id !== session?.user.id) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Get board data
    const squares = await getPoolSquares(id);
    const axis = await getAxisAssignment(id);
    const scores = await getPoolScores(id);

    // Get user's square count if authenticated
    let userSquareCount: number | undefined;
    if (session?.user.id) {
      userSquareCount = await getUserSquareCount(id, session.user.id);
    }

    // Parse axis digits
    const axisData = axis
      ? {
          pool_id: axis.pool_id,
          x_digits: JSON.parse(axis.x_digits_json),
          y_digits: JSON.parse(axis.y_digits_json),
          randomized_at: axis.randomized_at,
        }
      : null;

    return NextResponse.json({
      pool,
      squares,
      axis: axisData,
      scores,
      user_square_count: userSquareCount,
    });
  } catch (error) {
    console.error('Get board error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
