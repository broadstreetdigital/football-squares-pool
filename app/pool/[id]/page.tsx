/**
 * Pool Detail Page
 */

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { findPoolById } from '@/lib/db/repositories/pools';
import { getPoolSquares } from '@/lib/db/repositories/squares';
import { getAxisAssignment } from '@/lib/db/repositories/axis';
import { getPoolScores } from '@/lib/db/repositories/scores';
import { StatusBadge } from '@/components/StatusBadge';
import { ShareLink } from '@/components/ShareLink';
import { SquaresBoard } from '@/components/SquaresBoard';
import { ScoreEntryForm } from '@/components/ScoreEntryForm';
import { WinnersList } from '@/components/WinnersList';
import { OwnerControls } from '@/components/OwnerControls';
import { InviteCodeForm } from '@/components/InviteCodeForm';
import { calculateAllWinners } from '@/lib/game/winners';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PoolDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  // Fetch pool data
  const pool = await findPoolById(id);

  if (!pool) {
    notFound();
  }

  // Check visibility - redirect to login if not authenticated for private pools
  if (pool.visibility === 'private' && !session) {
    redirect(`/login?redirect=/pool/${id}`);
  }

  const isOwner = session?.user.id === pool.owner_id;

  // If private pool and not the owner, show invite code form
  const needsInviteCode = pool.visibility === 'private' && !isOwner;

  const canClaim = pool.status === 'open' && !!session;

  // Fetch board data
  const squares = await getPoolSquares(id);
  const axis = await getAxisAssignment(id);
  const scores = await getPoolScores(id);

  // Parse axis if exists
  const xDigits = axis ? JSON.parse(axis.x_digits_json) : undefined;
  const yDigits = axis ? JSON.parse(axis.y_digits_json) : undefined;

  // Calculate winners
  const winners =
    axis && scores.length > 0
      ? calculateAllWinners(scores, xDigits, yDigits, squares)
      : [];

  const gameDate = new Date(pool.game_time);

  return (
    <div className="min-h-screen bg-turf-gradient bg-yard-pattern">
      {/* Stadium lights effect */}
      <div className="fixed inset-0 bg-stadium-lights pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-display text-3xl text-stadium-gold">
            FOOTBALL SQUARES
          </Link>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className="btn-secondary">
                  Dashboard
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="btn-secondary">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Back Link */}
        {session && (
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-white/60 hover:text-white text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        )}

        {/* Show invite code form if user needs access */}
        {needsInviteCode ? (
          <InviteCodeForm poolId={pool.id} poolName={pool.name} />
        ) : (
          <>
            {/* Pool Header */}
            <div className="stadium-card p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-4xl text-white">
                  {pool.name}
                </h1>
                <StatusBadge status={pool.status} />
              </div>
              <p className="text-white/60 text-lg">{pool.game_name}</p>
            </div>

            {isOwner && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-stadium-gold/20 text-stadium-gold">
                You are the owner
              </span>
            )}
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <span className="text-white/50 text-sm block mb-1">Teams</span>
              <span className="text-white font-semibold">
                {pool.away_team} @ {pool.home_team}
              </span>
            </div>
            <div>
              <span className="text-white/50 text-sm block mb-1">
                Game Time
              </span>
              <span className="text-white font-semibold">
                {gameDate.toLocaleDateString()} at{' '}
                {gameDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-white/50 text-sm block mb-1">
                Square Price
              </span>
              <span className="text-white font-semibold">
                ${pool.square_price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Share Link */}
          <ShareLink poolId={pool.id} />
        </div>

        {/* Owner Controls */}
        {isOwner && (
          <div className="mb-8">
            <OwnerControls poolId={pool.id} status={pool.status} visibility={pool.visibility} inviteCode={pool.invite_code} />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Squares Board */}
          <div className="lg:col-span-2">
            <div className="stadium-card p-4 sm:p-6">
              <h2 className="font-display text-2xl text-white mb-4">
                GAME BOARD
              </h2>

              {/* Team Names and Info */}
              <div className="mb-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs">Away (Top):</span>
                    <span className="text-stadium-gold font-semibold">{pool.away_team}</span>
                  </div>
                  <span className="hidden sm:inline text-white/30">•</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs">Home (Left):</span>
                    <span className="text-stadium-gold font-semibold">{pool.home_team}</span>
                  </div>
                  {canClaim && (
                    <>
                      <span className="hidden sm:inline text-white/30">•</span>
                      <span className="text-stadium-gold text-xs">
                        Max {pool.max_squares_per_user} squares per user
                      </span>
                    </>
                  )}
                </div>
              </div>

              <SquaresBoard
                poolId={pool.id}
                squares={squares}
                xDigits={xDigits}
                yDigits={yDigits}
                currentUserId={session?.user.id}
                winners={winners.map((w) => ({ row: w.row, col: w.col }))}
                canClaim={canClaim}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Entry (Owner Only) */}
            {isOwner &&
              (pool.status === 'numbered' || pool.status === 'completed') && (
                <ScoreEntryForm
                  poolId={pool.id}
                  existingScores={scores}
                  awayTeam={pool.away_team}
                  homeTeam={pool.home_team}
                />
              )}

            {/* Winners */}
            <WinnersList winners={winners} />

            {/* Pool Info */}
            <div className="stadium-card p-6">
              <h3 className="font-display text-xl text-white mb-4">
                POOL INFO
              </h3>

              <div className="space-y-3 text-sm">
                {pool.entry_fee_info && (
                  <div>
                    <span className="text-white/50 block mb-1">Entry Fee</span>
                    <span className="text-white">{pool.entry_fee_info}</span>
                  </div>
                )}

                {pool.rules && (
                  <div>
                    <span className="text-white/50 block mb-1">Rules</span>
                    <p className="text-white whitespace-pre-wrap">
                      {pool.rules}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-white/50 block mb-1">Created</span>
                  <span className="text-white">
                    {new Date(pool.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
