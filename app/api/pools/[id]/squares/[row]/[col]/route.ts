/**
 * DELETE /api/pools/[id]/squares/[row]/[col]
 * Unclaim a square
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { unclaimSquare } from '@/lib/db/repositories/squares';
import { logEvent } from '@/lib/db/repositories/events';


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; row: string; col: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: poolId, row: rowStr, col: colStr } = await params;

    const row = parseInt(rowStr, 10);
    const col = parseInt(colStr, 10);

    // Validate row and col
    if (
      isNaN(row) ||
      isNaN(col) ||
      row < 0 ||
      row > 9 ||
      col < 0 ||
      col > 9
    ) {
      return NextResponse.json(
        { error: 'Invalid row or column' },
        { status: 400 }
      );
    }

    // Unclaim square (handles all validation and transactions)
    await unclaimSquare(poolId, row, col, session.user.id);

    // Log event
    await logEvent(poolId, session.user.id, 'square_unclaimed', {
      row,
      col,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unclaim square error:', error);

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (
        error.message.includes('not open') ||
        error.message.includes('not claimed') ||
        error.message.includes('do not own')
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
