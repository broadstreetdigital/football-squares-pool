/**
 * Dashboard Page
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/session';
import { findPoolsByOwner, findPoolsByUser } from '@/lib/db/repositories/pools';
import { getUserSquareCount } from '@/lib/db/repositories/squares';
import { PoolCard } from '@/components/PoolCard';

export default async function DashboardPage() {
  const session = await requireAuth().catch(() => null);

  if (!session) {
    redirect('/login');
  }

  // Fetch user's pools
  const ownedPools = await findPoolsByOwner(session.user.id);
  const joinedPools = await findPoolsByUser(session.user.id);

  // Filter out owned pools from joined pools
  const participantPools = joinedPools.filter(
    (pool) => !ownedPools.some((owned) => owned.id === pool.id)
  );

  // Get square counts for joined pools
  const joinedPoolsWithCounts = await Promise.all(
    participantPools.map(async (pool) => {
      const count = await getUserSquareCount(pool.id, session.user.id);
      return { pool, count };
    })
  );

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
            <span className="text-white/60">
              Welcome, <span className="text-white">{session.user.name}</span>
            </span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="btn-secondary">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-5xl text-white">DASHBOARD</h1>
          <Link href="/pool/new" className="btn-primary">
            + Create New Pool
          </Link>
        </div>

        {/* My Pools Section */}
        <section className="mb-12">
          <h2 className="font-display text-3xl text-stadium-gold mb-6">
            MY POOLS
          </h2>

          {ownedPools.length === 0 ? (
            <div className="stadium-card p-8 text-center">
              <p className="text-white/60 mb-4">
                You haven't created any pools yet.
              </p>
              <Link href="/pool/new" className="btn-primary">
                Create Your First Pool
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedPools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} isOwner={true} />
              ))}
            </div>
          )}
        </section>

        {/* Joined Pools Section */}
        <section>
          <h2 className="font-display text-3xl text-stadium-gold mb-6">
            JOINED POOLS
          </h2>

          {joinedPoolsWithCounts.length === 0 ? (
            <div className="stadium-card p-8 text-center">
              <p className="text-white/60">
                You haven't joined any pools yet. Ask friends for pool links!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedPoolsWithCounts.map(({ pool, count }) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  userSquareCount={count}
                  isOwner={false}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
