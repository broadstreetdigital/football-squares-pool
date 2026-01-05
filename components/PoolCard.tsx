/**
 * Pool Card Component
 */

import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import type { Pool } from '@/lib/db/types';

interface PoolCardProps {
  pool: Pool;
  userSquareCount?: number;
  isOwner?: boolean;
}

export function PoolCard({ pool, userSquareCount, isOwner }: PoolCardProps) {
  const gameDate = new Date(pool.game_time);

  return (
    <Link href={`/pool/${pool.id}`}>
      <div className="stadium-card p-6 hover:bg-white/5 transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display text-2xl text-white mb-1">
              {pool.name}
            </h3>
            <p className="text-white/60 text-sm">{pool.game_name}</p>
          </div>
          <StatusBadge status={pool.status} />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Teams:</span>
            <span className="text-white">
              {pool.away_team} @ {pool.home_team}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Game Time:</span>
            <span className="text-white">
              {gameDate.toLocaleDateString()} at {gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {userSquareCount !== undefined && userSquareCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/50">Your Squares:</span>
              <span className="text-stadium-gold font-semibold">
                {userSquareCount}
              </span>
            </div>
          )}

          {isOwner && (
            <div className="mt-3">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-stadium-gold/20 text-stadium-gold">
                You are the owner
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm border-t border-white/10 pt-3">
          <span className="text-white/50">Square Price:</span>
          <span className="text-white font-semibold">
            ${pool.square_price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
