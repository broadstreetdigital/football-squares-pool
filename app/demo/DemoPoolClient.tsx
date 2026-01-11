'use client';

/**
 * Interactive Demo Pool - Client Component
 * Shows what it's like to be a pool owner without requiring signup
 */

import { useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';

type PoolStatus = 'open' | 'locked' | 'numbered' | 'completed';
type Bucket = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'FINAL';

const bucketLabels: Record<Bucket, string> = {
  Q1: '1st Quarter',
  Q2: '2nd Quarter',
  Q3: '3rd Quarter',
  Q4: '4th Quarter',
  FINAL: 'Final',
};

interface Square {
  row: number;
  col: number;
  claimed_by_user_id: string | null;
  claimed_display_name: string | null;
}

interface Score {
  bucket: Bucket;
  home_score: number;
  away_score: number;
}

interface Winner {
  bucket: Bucket;
  row: number;
  col: number;
  claimedBy: string | null;
}

export default function DemoPoolClient() {
  // Demo pool state
  const [status, setStatus] = useState<PoolStatus>('open');
  const [squares, setSquares] = useState<Square[]>(initializeSquares());
  const [xDigits, setXDigits] = useState<number[] | undefined>(undefined);
  const [yDigits, setYDigits] = useState<number[] | undefined>(undefined);
  const [scores, setScores] = useState<Score[]>([]);

  const poolData = {
    name: 'Super Bowl Demo Pool',
    game_name: 'Super Bowl LIX',
    away_team: 'Eagles',
    home_team: 'Chiefs',
    square_price: 10.0,
    max_squares_per_user: 5,
    game_time: '2025-02-09T18:30:00',
  };

  // Initialize empty squares
  function initializeSquares(): Square[] {
    const squares: Square[] = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        squares.push({
          row,
          col,
          claimed_by_user_id: null,
          claimed_display_name: null,
        });
      }
    }
    return squares;
  }

  // Handle square claim (demo users)
  const handleSquareClick = (row: number, col: number) => {
    if (status !== 'open') return;

    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    setSquares((prev) =>
      prev.map((sq) =>
        sq.row === row && sq.col === col
          ? {
              ...sq,
              claimed_by_user_id: sq.claimed_by_user_id ? null : 'demo-user',
              claimed_display_name: sq.claimed_by_user_id ? null : randomName,
            }
          : sq
      )
    );
  };

  // Lock the board
  const handleLock = () => {
    setStatus('locked');
  };

  // Randomize digits
  const handleRandomize = () => {
    const shuffle = (arr: number[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    setXDigits(shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
    setYDigits(shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
    setStatus('numbered');
  };

  // Clear board
  const handleClear = () => {
    setSquares(initializeSquares());
  };

  // Update scores
  const handleUpdateScore = (bucket: Bucket, homeScore: number, awayScore: number) => {
    setScores((prev) => {
      const existing = prev.find((s) => s.bucket === bucket);
      if (existing) {
        return prev.map((s) =>
          s.bucket === bucket ? { ...s, home_score: homeScore, away_score: awayScore } : s
        );
      }
      return [...prev, { bucket, home_score: homeScore, away_score: awayScore }];
    });
  };

  // Calculate winners
  const calculateWinners = (): Winner[] => {
    if (!xDigits || !yDigits || scores.length === 0) return [];

    const winners: Winner[] = [];
    scores.forEach((score) => {
      const awayDigit = score.away_score % 10;
      const homeDigit = score.home_score % 10;

      const col = xDigits.indexOf(awayDigit);
      const row = yDigits.indexOf(homeDigit);

      if (col !== -1 && row !== -1) {
        const square = squares.find((sq) => sq.row === row && sq.col === col);
        winners.push({
          bucket: score.bucket,
          row,
          col,
          claimedBy: square?.claimed_display_name || null,
        });
      }
    });

    return winners;
  };

  const winners = calculateWinners();
  const gameDate = new Date(poolData.game_time);

  return (
    <div className="min-h-screen bg-turf-gradient bg-yard-pattern">
      {/* Stadium lights effect */}
      <div className="fixed inset-0 bg-stadium-lights pointer-events-none" />

      {/* Demo Banner */}
      <div className="relative z-10 bg-stadium-gold text-turf-900 py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="font-semibold">
            🎮 DEMO MODE - This is a sample pool to explore owner features.{' '}
            <Link href="/register" className="underline hover:no-underline">
              Sign up to create your own!
            </Link>
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-display text-2xl sm:text-3xl text-stadium-gold leading-tight flex items-center gap-2 sm:gap-3">
            <img src="/football.svg" alt="Football" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span>FOOTBALL SQUARES POOL</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-secondary">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="text-white/60 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>

        {/* Pool Header */}
        <div className="stadium-card p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-4xl text-white">{poolData.name}</h1>
                <StatusBadge status={status} />
              </div>
              <p className="text-white/60 text-lg">{poolData.game_name}</p>
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-stadium-gold/20 text-stadium-gold">
              Demo Owner View
            </span>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-white/50 text-sm block mb-1">Teams</span>
              <span className="text-white font-semibold">
                {poolData.away_team} @ {poolData.home_team}
              </span>
            </div>
            <div>
              <span className="text-white/50 text-sm block mb-1">Game Time</span>
              <span className="text-white font-semibold">
                {gameDate.toLocaleDateString()} at{' '}
                {gameDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-white/50 text-sm block mb-1">Square Price</span>
              <span className="text-white font-semibold">${poolData.square_price.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-white/50 text-sm block mb-1">Max Per User</span>
              <span className="text-white font-semibold">{poolData.max_squares_per_user} squares</span>
            </div>
          </div>
        </div>

        {/* Owner Controls */}
        <div className="mb-8">
          <div className="stadium-card p-6">
            <h3 className="font-display text-2xl text-white mb-4">OWNER CONTROLS</h3>

            <div className="flex flex-wrap gap-3">
              {status === 'open' && (
                <>
                  <button onClick={handleLock} className="btn-primary">
                    Lock Board
                  </button>
                  <button onClick={handleClear} className="btn-secondary">
                    Clear All Squares
                  </button>
                </>
              )}

              {status === 'locked' && (
                <button onClick={handleRandomize} className="btn-primary">
                  Randomize Digits
                </button>
              )}

              {status === 'numbered' && (
                <div className="text-white/70 text-sm">
                  Board is ready! Enter scores below to see winners.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Squares Board */}
          <div className="lg:col-span-2">
            <div className="stadium-card p-4 sm:p-6">
              <h2 className="font-display text-2xl text-white mb-4">GAME BOARD</h2>

              {status === 'open' && (
                <div className="mb-4 p-3 bg-stadium-gold/10 border border-stadium-gold/30 rounded-lg">
                  <p className="text-stadium-gold text-sm">
                    Click squares to simulate users claiming them!
                  </p>
                </div>
              )}

              {/* Board */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {/* Team labels */}
                  <div className="flex items-center mb-2">
                    <div className="w-12"></div>
                    <div className="flex-1 text-center">
                      <span className="text-white font-semibold text-sm">{poolData.away_team}</span>
                    </div>
                  </div>

                  <div className="flex">
                    {/* Y-axis label */}
                    <div className="flex flex-col justify-center mr-2">
                      <span className="text-white font-semibold text-sm transform -rotate-90 whitespace-nowrap">
                        {poolData.home_team}
                      </span>
                    </div>

                    <div>
                      {/* X-axis digits */}
                      <div className="flex mb-1">
                        <div className="w-8"></div>
                        {Array.from({ length: 10 }).map((_, col) => (
                          <div
                            key={col}
                            className="w-10 h-8 flex items-center justify-center text-stadium-gold font-bold text-sm"
                          >
                            {xDigits ? xDigits[col] : '?'}
                          </div>
                        ))}
                      </div>

                      {/* Grid */}
                      {Array.from({ length: 10 }).map((_, row) => (
                        <div key={row} className="flex">
                          {/* Y-axis digit */}
                          <div className="w-8 h-10 flex items-center justify-center text-stadium-gold font-bold text-sm">
                            {yDigits ? yDigits[row] : '?'}
                          </div>

                          {/* Row squares */}
                          {Array.from({ length: 10 }).map((_, col) => {
                            const square = squares.find((sq) => sq.row === row && sq.col === col);
                            const isWinner = winners.some((w) => w.row === row && w.col === col);
                            const isClaimed = square?.claimed_by_user_id;

                            return (
                              <button
                                key={col}
                                onClick={() => handleSquareClick(row, col)}
                                disabled={status !== 'open'}
                                className={`w-10 h-10 border border-white/30 text-xs flex items-center justify-center transition-all ${
                                  isWinner
                                    ? 'bg-stadium-gold text-turf-900 font-bold animate-pulse-gold'
                                    : isClaimed
                                    ? 'bg-white/10 text-white hover:bg-white/20'
                                    : 'bg-turf-500/30 text-white/70 hover:bg-turf-400/40'
                                } ${status === 'open' ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                {square?.claimed_display_name?.substring(0, 3) || ''}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Score Entry */}
            {status === 'numbered' && (
              <div className="stadium-card p-6">
                <h3 className="font-display text-xl text-white mb-4">ENTER SCORES</h3>

                <div className="space-y-3">
                  {(['Q1', 'Q2', 'Q3', 'Q4', 'FINAL'] as Bucket[]).map((bucket) => {
                    const score = scores.find((s) => s.bucket === bucket);
                    return (
                      <div key={bucket} className="border border-white/10 rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-2">{bucketLabels[bucket]}</div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder={poolData.away_team}
                            className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
                            value={score?.away_score || ''}
                            onChange={(e) =>
                              handleUpdateScore(
                                bucket,
                                score?.home_score || 0,
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                          <input
                            type="number"
                            placeholder={poolData.home_team}
                            className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-sm"
                            value={score?.home_score || ''}
                            onChange={(e) =>
                              handleUpdateScore(
                                bucket,
                                parseInt(e.target.value) || 0,
                                score?.away_score || 0
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Winners */}
            {winners.length > 0 && (
              <div className="stadium-card p-6">
                <h3 className="font-display text-xl text-white mb-4">WINNERS</h3>

                <div className="space-y-3">
                  {winners.map((winner, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-stadium-gold/10 border border-stadium-gold/30 rounded-lg"
                    >
                      <div>
                        <div className="text-stadium-gold font-semibold">{bucketLabels[winner.bucket]}</div>
                        <div className="text-white/70 text-sm">
                          {winner.claimedBy || 'Unclaimed'}
                        </div>
                      </div>
                      <div className="text-white/50 text-xs">
                        [{winner.row}, {winner.col}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="stadium-card p-6">
              <h3 className="font-display text-xl text-white mb-4">HOW IT WORKS</h3>

              <div className="space-y-3 text-sm text-white/70">
                <p>
                  <strong className="text-white">1. Fill Board:</strong> Click squares to simulate
                  users claiming them.
                </p>
                <p>
                  <strong className="text-white">2. Lock Board:</strong> Prevent further claims.
                </p>
                <p>
                  <strong className="text-white">3. Randomize:</strong> Assign random digits to
                  axes.
                </p>
                <p>
                  <strong className="text-white">4. Enter Scores:</strong> Track game scores and
                  see winners!
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <Link href="/register" className="btn-primary w-full text-center block">
                  Sign Up to Create Your Pool
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
