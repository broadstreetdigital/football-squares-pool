/**
 * Winners List Component
 */

import type { Winner } from '@/lib/db/types';

interface WinnersListProps {
  winners: Winner[];
}

export function WinnersList({ winners }: WinnersListProps) {
  if (winners.length === 0) {
    return (
      <div className="stadium-card p-6">
        <h3 className="font-display text-2xl text-white mb-4">WINNERS</h3>
        <p className="text-white/60 text-sm">No scores entered yet</p>
      </div>
    );
  }

  const bucketOrder = ['Q1', 'Q2', 'Q3', 'Q4', 'FINAL'];
  const sortedWinners = [...winners].sort(
    (a, b) => bucketOrder.indexOf(a.bucket) - bucketOrder.indexOf(b.bucket)
  );

  return (
    <div className="stadium-card p-6">
      <h3 className="font-display text-2xl text-white mb-4">WINNERS</h3>

      <div className="space-y-4">
        {sortedWinners.map((winner) => (
          <div
            key={winner.bucket}
            className="border border-white/10 rounded-lg p-4 bg-stadium-gold/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-xl text-stadium-gold">
                {winner.bucket}
              </span>
              <span className="text-white/60 text-sm">
                Square ({winner.row}, {winner.col})
              </span>
            </div>

            <div className="text-white mb-2">
              Score: {winner.away_score} - {winner.home_score}
            </div>

            {winner.claimed_display_name ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-stadium-gold" />
                <span className="text-stadium-gold font-semibold">
                  {winner.claimed_display_name}
                </span>
              </div>
            ) : (
              <span className="text-white/50 text-sm italic">Unclaimed square</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
