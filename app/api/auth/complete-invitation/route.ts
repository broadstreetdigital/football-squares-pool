/**
 * POST /api/auth/complete-invitation
 * Complete account signup from a pool invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth/password';
import { createToken } from '@/lib/auth/jwt';
import { createUser, findUserByEmail } from '@/lib/db/repositories/users';
import { findInvitationByToken, acceptInvitation, isInvitationValid } from '@/lib/db/repositories/invitations';
import { getCookieOptions } from '@/lib/auth/session';

const completeInvitationSchema = z.object({
  invitationToken: z.string().min(1, 'Invitation token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  emailConsent: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = completeInvitationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { invitationToken, password, emailConsent } = validation.data;

    // Find invitation
    const invitation = await findInvitationByToken(invitationToken);
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    // Check if invitation is valid
    if (!isInvitationValid(invitation)) {
      return NextResponse.json(
        { error: 'This invitation has expired or has already been used' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(invitation.invited_email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(
      invitation.invited_email,
      passwordHash,
      invitation.invited_name,
      emailConsent
    );

    // Mark invitation as accepted
    await acceptInvitation(invitation.id, user.id);

    // Create JWT
    const token = await createToken(user.id, user.email, user.name);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, getCookieOptions());

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        poolId: invitation.pool_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Complete invitation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
