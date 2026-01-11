/**
 * Invitation Completion Page
 * Users who received pool invitations complete their account setup here
 */

import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { findInvitationByToken, isInvitationValid } from '@/lib/db/repositories/invitations';
import { findPoolById } from '@/lib/db/repositories/pools';
import { findUserByEmail } from '@/lib/db/repositories/users';
import { InvitationSignupForm } from '@/components/InvitationSignupForm';

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = await params;
  const session = await getSession();

  // Find invitation
  const invitation = await findInvitationByToken(token);

  if (!invitation) {
    notFound();
  }

  // Check if invitation is valid
  if (!isInvitationValid(invitation)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turf-green via-green-800 to-turf-green flex items-center justify-center p-4">
        <div className="stadium-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="font-display text-3xl text-white mb-4">
            Invitation Expired
          </h1>
          <p className="text-white/80 mb-6">
            This invitation link has expired. Please contact the pool manager for a new invitation.
          </p>
          <a href="/" className="btn-primary inline-block">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  // Get pool details
  const pool = await findPoolById(invitation.pool_id);

  if (!pool) {
    notFound();
  }

  // Check if user already exists with this email
  const existingUser = await findUserByEmail(invitation.invited_email);

  // If user is already logged in and matches the invitation email
  if (session && session.user.email.toLowerCase() === invitation.invited_email.toLowerCase()) {
    // User is already logged in with the correct account - redirect to pool
    redirect(`/pool/${pool.id}`);
  }

  // If user exists but not logged in
  if (existingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turf-green via-green-800 to-turf-green flex items-center justify-center p-4">
        <div className="stadium-card max-w-md w-full p-8">
          <div className="text-6xl mb-4 text-center">🔑</div>
          <h1 className="font-display text-3xl text-white mb-4 text-center">
            Account Exists
          </h1>
          <p className="text-white/80 mb-6 text-center">
            An account with <strong>{invitation.invited_email}</strong> already exists. Please sign in to view your pool.
          </p>
          <a href={`/login?redirect=/pool/${pool.id}`} className="btn-primary block text-center">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Parse claimed squares
  const claimedSquares = JSON.parse(invitation.claimed_squares_json);

  return (
    <div className="min-h-screen bg-gradient-to-br from-turf-green via-green-800 to-turf-green flex items-center justify-center p-4">
      <div className="stadium-card max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-display text-4xl text-white mb-2">
            You're Invited!
          </h1>
          <p className="text-white/80">
            Complete your account to join the pool
          </p>
        </div>

        {/* Pool Info */}
        <div className="bg-white/5 rounded-lg p-6 mb-8">
          <h2 className="font-display text-xl text-stadium-gold mb-4">
            Pool Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Pool Name:</span>
              <span className="text-white font-semibold">{pool.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Game:</span>
              <span className="text-white font-semibold">{pool.game_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Your Squares:</span>
              <span className="text-stadium-gold font-bold">{claimedSquares.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Price Per Square:</span>
              <span className="text-white font-semibold">${pool.square_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-white/10 pt-3">
              <span className="text-white/70">Total:</span>
              <span className="text-stadium-gold font-bold text-xl">
                ${(claimedSquares.length * pool.square_price).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/70 text-sm mb-2">Your squares:</p>
            <div className="flex flex-wrap gap-2">
              {claimedSquares.map((sq: { row: number; col: number }) => (
                <span
                  key={`${sq.row}-${sq.col}`}
                  className="bg-stadium-gold/20 border border-stadium-gold text-stadium-gold px-3 py-1 rounded text-sm font-semibold"
                >
                  ({sq.row}, {sq.col})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <InvitationSignupForm
          invitationToken={token}
          email={invitation.invited_email}
          name={invitation.invited_name}
          poolId={pool.id}
        />
      </div>
    </div>
  );
}
