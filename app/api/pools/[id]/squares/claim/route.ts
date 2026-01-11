/**
 * POST /api/pools/[id]/squares/claim
 * Claim squares in a pool
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { claimSquaresSchema } from '@/lib/utils/validation';
import { claimSquares } from '@/lib/db/repositories/squares';
import { logEvent } from '@/lib/db/repositories/events';
import { getUserPublic } from '@/lib/db/repositories/users';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: poolId } = await params;
    const body = await request.json();

    // Validate input
    const validation = claimSquaresSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Get user data
    const user = await getUserPublic(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Claim squares (handles all validation and transactions)
    await claimSquares({
      pool_id: poolId,
      user_id: session.user.id,
      display_name: user.name,
      email: user.email,
      squares: validation.data.squares,
    });

    // Log event (don't fail if this errors)
    try {
      await logEvent(poolId, session.user.id, 'squares_claimed', {
        count: validation.data.squares.length,
        squares: validation.data.squares,
      });
    } catch (logError) {
      console.error('Failed to log event (non-fatal):', logError);
    }

    return NextResponse.json({
      success: true,
      claimed: validation.data.squares.length,
    });
  } catch (error) {
    console.error('Claim squares error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (
        error.message.includes('already claimed') ||
        error.message.includes('not open') ||
        error.message.includes('exceed')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Return the actual error message for better debugging
      console.error('Unexpected error:', error.message, error.stack);
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
