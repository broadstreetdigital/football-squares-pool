/**
 * Pool Card Component
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import type { Pool } from '@/lib/db/types';

interface PoolCardProps {
  pool: Pool;
  userSquareCount?: number;
  isOwner?: boolean;
}

export function PoolCard({ pool, userSquareCount, isOwner }: PoolCardProps) {
  const gameDate = new Date(pool.game_time);
  const [copied, setCopied] = useState(false);

  const poolUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/pool/${pool.id}`
    : '';

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(poolUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Link href={`/pool/${pool.id}`}>
      <div className="stadium-card p-6 hover:bg-white/5 transition-all cursor-pointer relative">
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

          {userSquareCount !== undefined && userSquareCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white/50">Your Squares:</span>
              <span className="text-stadium-gold font-semibold">
                {userSquareCount}
              </span>
            </div>
          )}
        </div>

        {/* Share URL */}
        <div className="mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs flex-shrink-0">Share:</span>
            <input
              type="text"
              value={poolUrl}
              readOnly
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white/60 text-xs font-mono truncate"
              onClick={(e) => e.preventDefault()}
            />
            <button
              onClick={handleCopyUrl}
              className="flex-shrink-0 bg-stadium-gold/20 hover:bg-stadium-gold/30 text-stadium-gold px-3 py-1 rounded text-xs font-semibold transition-colors border border-stadium-gold/30"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Square price */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Square Price:</span>
          <span className="text-white font-semibold">
            ${pool.square_price.toFixed(2)}
          </span>
        </div>
      </div>
    </Link>
  );
}
