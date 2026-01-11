/**
 * Interactive 10x10 Squares Board Component
 * Client component for claiming squares
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import type { Square } from '@/lib/db/types';

interface SquaresBoardProps {
  poolId: string;
  squares: Square[];
  xDigits?: number[];
  yDigits?: number[];
  currentUserId?: string;
  winners?: Array<{ row: number; col: number }>;
  canClaim: boolean;
  onClaim?: (squares: Array<{ row: number; col: number }>) => void;
}

export function SquaresBoard({
  poolId,
  squares,
  xDigits,
  yDigits,
  currentUserId,
  winners = [],
  canClaim,
  onClaim,
}: SquaresBoardProps) {
  const [selectedSquares, setSelectedSquares] = useState<Set<string>>(new Set());
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSquare = (row: number, col: number) => {
    if (!canClaim) return;

    const square = squares.find((s) => s.row === row && s.col === col);
    if (square?.claimed_by_user_id || square?.claimed_display_name) return;

    const key = `${row},${col}`;
    const newSelected = new Set(selectedSquares);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedSquares(newSelected);
  };

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);

    const squaresToClaim = Array.from(selectedSquares).map((key) => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });

    try {
      const res = await fetch(`/api/pools/${poolId}/squares/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squares: squaresToClaim }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to claim squares');
      }

      // Clear selection and refresh page
      setSelectedSquares(new Set());
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setClaiming(false);
    }
  };

  const getSquareClass = (row: number, col: number) => {
    const square = squares.find((s) => s.row === row && s.col === col);
    const isWinner = winners.some((w) => w.row === row && w.col === col);
    const isMine = square?.claimed_by_user_id === currentUserId;
    const isClaimed = square?.claimed_by_user_id || square?.claimed_display_name;
    const isSelected = selectedSquares.has(`${row},${col}`);

    if (isWinner) return 'square square-winner';
    if (isMine) return 'square square-mine';
    if (isClaimed) return 'square square-claimed';
    if (isSelected) return 'square bg-stadium-gold/50 border-stadium-gold';
    return 'square square-unclaimed';
  };

  const getSquareContent = (row: number, col: number) => {
    const square = squares.find((s) => s.row === row && s.col === col);
    if (!square) return '';

    if (square.claimed_display_name) {
      const names = square.claimed_display_name.split(' ');
      return names.length > 1 ? `${names[0]} ${names[names.length - 1][0]}.` : names[0];
    }

    return '';
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Board Container */}
      <div className="w-full overflow-x-auto -mx-2 px-2 pb-2">
        <div className="inline-block min-w-max">
          {/* X Axis (Away Team) */}
          {xDigits && (
            <div className="flex">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20" /> {/* Corner spacer */}
              {xDigits.map((digit, i) => (
                <div
                  key={i}
                  className="w-14 h-12 sm:w-16 sm:h-14 md:w-20 md:h-16 lg:w-24 lg:h-20 flex items-center justify-center font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-stadium-gold font-bold"
                >
                  {digit}
                </div>
              ))}
            </div>
          )}

          {/* Board Grid */}
          {Array.from({ length: 10 }).map((_, row) => (
            <div key={row} className="flex">
              {/* Y Axis (Home Team) */}
              {yDigits && (
                <div className="w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-20 lg:w-20 lg:h-24 flex items-center justify-center font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-stadium-gold font-bold">
                  {yDigits[row]}
                </div>
              )}

              {/* Squares */}
              {Array.from({ length: 10 }).map((_, col) => (
                <button
                  key={col}
                  className={cn(getSquareClass(row, col), 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-[10px] sm:text-xs md:text-sm')}
                  onClick={() => toggleSquare(row, col)}
                  disabled={!canClaim || claiming}
                >
                  <span className="truncate px-0.5 sm:px-1 leading-tight">
                    {getSquareContent(row, col)}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Claim Button */}
      {canClaim && selectedSquares.size > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming
              ? 'Claiming...'
              : `Claim ${selectedSquares.size} Square${selectedSquares.size !== 1 ? 's' : ''}`
            }
          </button>
        </div>
      )}
    </div>
  );
}
