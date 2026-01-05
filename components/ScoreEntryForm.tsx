/**
 * Score Entry Form Component (Owner only)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Score } from '@/lib/db/types';

interface ScoreEntryFormProps {
  poolId: string;
  existingScores: Score[];
  awayTeam: string;
  homeTeam: string;
}

type Bucket = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'FINAL';

export function ScoreEntryForm({
  poolId,
  existingScores,
  awayTeam,
  homeTeam,
}: ScoreEntryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form state with existing scores
  const getInitialScore = (bucket: Bucket, team: 'home' | 'away') => {
    const score = existingScores.find((s) => s.bucket === bucket);
    return score ? String(score[`${team}_score`]) : '';
  };

  const [scores, setScores] = useState({
    Q1: {
      away: getInitialScore('Q1', 'away'),
      home: getInitialScore('Q1', 'home'),
    },
    Q2: {
      away: getInitialScore('Q2', 'away'),
      home: getInitialScore('Q2', 'home'),
    },
    Q3: {
      away: getInitialScore('Q3', 'away'),
      home: getInitialScore('Q3', 'home'),
    },
    Q4: {
      away: getInitialScore('Q4', 'away'),
      home: getInitialScore('Q4', 'home'),
    },
    FINAL: {
      away: getInitialScore('FINAL', 'away'),
      home: getInitialScore('FINAL', 'home'),
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Build scores array (only include non-empty)
    const scoresArray = [];
    for (const [bucket, values] of Object.entries(scores)) {
      if (values.away !== '' && values.home !== '') {
        scoresArray.push({
          bucket: bucket as Bucket,
          away_score: parseInt(values.away, 10),
          home_score: parseInt(values.home, 10),
        });
      }
    }

    if (scoresArray.length === 0) {
      setError('Please enter at least one score');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/pools/${poolId}/scores`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: scoresArray }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to update scores');
      }

      // Refresh the page to show updated winners
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stadium-card p-6">
      <h3 className="font-display text-2xl text-white mb-4">ENTER SCORES</h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {(['Q1', 'Q2', 'Q3', 'Q4', 'FINAL'] as Bucket[]).map((bucket) => (
          <div key={bucket} className="border border-white/10 rounded-lg p-4">
            <h4 className="font-display text-lg text-stadium-gold mb-3">
              {bucket}
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  {awayTeam} (Away)
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={scores[bucket].away}
                  onChange={(e) =>
                    setScores({
                      ...scores,
                      [bucket]: { ...scores[bucket], away: e.target.value },
                    })
                  }
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">
                  {homeTeam} (Home)
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={scores[bucket].home}
                  onChange={(e) =>
                    setScores({
                      ...scores,
                      [bucket]: { ...scores[bucket], home: e.target.value },
                    })
                  }
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating Scores...' : 'Update Scores'}
      </button>
    </form>
  );
}
