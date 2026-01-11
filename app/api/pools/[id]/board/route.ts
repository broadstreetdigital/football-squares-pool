/**
 * GET /api/pools/[id]/board
 * Get complete board state (pool, squares, axis, scores)
 *
 * DELETE /api/pools/[id]/board
 * Remove a square claim (owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { findPoolById } from '@/lib/db/repositories/pools';
import { getPoolSquares, getUserSquareCount } from '@/lib/db/repositories/squares';
import { getAxisAssignment } from '@/lib/db/repositories/axis';
import { getPoolScores } from '@/lib/db/repositories/scores';
import { execute } from '@/lib/db/client';


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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pool
    const pool = await findPoolById(id);

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Check if user is the owner
    if (pool.owner_id !== session.user.id) {
      return NextResponse.json({ error: 'Only the pool manager can remove claims' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { row, col } = body;

    if (typeof row !== 'number' || typeof col !== 'number') {
      return NextResponse.json({ error: 'Invalid square coordinates' }, { status: 400 });
    }

    if (row < 0 || row > 9 || col < 0 || col > 9) {
      return NextResponse.json({ error: 'Square coordinates must be between 0 and 9' }, { status: 400 });
    }

    // Remove the claim
    await execute(
      `UPDATE squares
       SET claimed_by_user_id = NULL,
           claimed_display_name = NULL,
           claimed_email = NULL,
           claimed_at = NULL
       WHERE pool_id = ? AND row = ? AND col = ?`,
      [id, row, col]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
