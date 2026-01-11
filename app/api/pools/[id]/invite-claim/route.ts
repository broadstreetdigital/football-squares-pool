/**
 * POST /api/pools/[id]/invite-claim
 * Manager invites someone and claims squares on their behalf
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { findPoolById } from '@/lib/db/repositories/pools';
import { getSquare } from '@/lib/db/repositories/squares';
import { createPoolInvitation } from '@/lib/db/repositories/invitations';
import { execute } from '@/lib/db/client';
import { sendPoolInvitationEmail } from '@/lib/email/sendgrid';
import { z } from 'zod';

const inviteClaimSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  squares: z.array(
    z.object({
      row: z.number().min(0).max(9),
      col: z.number().min(0).max(9),
    })
  ).min(1, 'At least one square must be selected'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: poolId } = await params;
    const body = await request.json();

    // Validate input
    const validation = inviteClaimSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, squares } = validation.data;

    // Get pool
    const pool = await findPoolById(poolId);
    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Check if user is the owner
    if (pool.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the pool manager can invite participants' },
        { status: 403 }
      );
    }

    // Verify all squares are unclaimed
    for (const square of squares) {
      const existing = await getSquare(poolId, square.row, square.col);
      if (existing && (existing.claimed_by_user_id || existing.claimed_display_name)) {
        return NextResponse.json(
          { error: `Square (${square.row}, ${square.col}) is already claimed` },
          { status: 400 }
        );
      }
    }

    // Create invitation
    const invitation = await createPoolInvitation({
      poolId,
      invitedEmail: email,
      invitedName: name,
      invitedByUserId: session.user.id,
      claimedSquares: squares,
    });

    // Claim squares on behalf of the invited person
    const claimedAt = Date.now();
    for (const square of squares) {
      await execute(
        `UPDATE squares
         SET claimed_by_user_id = NULL,
             claimed_display_name = ?,
             claimed_email = ?,
             claimed_at = ?
         WHERE pool_id = ? AND row = ? AND col = ?`,
        [name, email.toLowerCase(), claimedAt, poolId, square.row, square.col]
      );
    }

    // Send invitation email (non-blocking)
    const gameDate = new Date(pool.game_time).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    sendPoolInvitationEmail({
      email: invitation.invited_email,
      invitedName: invitation.invited_name,
      managerName: session.user.name,
      poolName: pool.name,
      poolId: pool.id,
      gameDate,
      squarePrice: pool.square_price,
      squares,
      invitationToken: invitation.invitation_token,
    }).catch((err) => {
      console.error('Failed to send pool invitation email:', err);
      // Don't block the invitation if email fails
    });

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.invited_email,
          name: invitation.invited_name,
          squares: squares.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Invite claim error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
