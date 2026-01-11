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
      <div className="stadium-card p-6 hover:bg-white/5 transition-all cursor-pointer relative group">
        {/* Top right badges */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          {isOwner && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-stadium-gold/20 text-stadium-gold border border-stadium-gold/30">
              You are the owner
            </span>
          )}
          <StatusBadge status={pool.status} />
        </div>

        {/* Pool name and game */}
        <div className="mb-4 pr-32">
          <h3 className="font-display text-2xl text-white mb-1">
            {pool.name}
          </h3>
          <p className="text-white/60 text-sm">{pool.game_name}</p>
        </div>

        {/* Pool details */}
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

          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Type:</span>
            <span className="text-white">
              {pool.visibility === 'private' ? 'Private' : 'Public'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Max Squares Per User:</span>
            <span className="text-white font-semibold">
              {pool.max_squares_per_user}
            </span>
          </div>
        </div>

        {/* Bottom section with border and padding for View Pool link */}
        <div className="space-y-2 border-t border-white/10 pt-3 pb-8">
          {userSquareCount !== undefined && userSquareCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Your Squares:</span>
              <span className="text-stadium-gold font-semibold">
                {userSquareCount}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Square Price:</span>
            <span className="text-white font-semibold">
              ${pool.square_price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* View Pool indicator - Arrow */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-stadium-gold/60 group-hover:text-stadium-gold transition-colors">
          <span className="text-xs font-semibold">View Pool</span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
