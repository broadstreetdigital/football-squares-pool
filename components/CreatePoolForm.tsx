/**
 * Create Pool Form Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/utils/api';

export function CreatePoolForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Parse game time
    const gameDate = formData.get('gameDate') as string;
    const gameTime = formData.get('gameTime') as string;
    const gameDateTime = new Date(`${gameDate}T${gameTime}`);

    const data = {
      name: formData.get('name') as string,
      game_name: formData.get('game_name') as string,
      game_time: gameDateTime.getTime(),
      home_team: formData.get('home_team') as string,
      away_team: formData.get('away_team') as string,
      square_price: parseFloat(formData.get('square_price') as string),
      max_squares_per_user: parseInt(
        formData.get('max_squares_per_user') as string,
        10
      ),
      visibility,
      entry_fee_info: formData.get('entry_fee_info') as string,
      rules: formData.get('rules') as string,
      invite_code: visibility === 'private' ? (formData.get('invite_code') as string) : undefined,
    };

    try {
      const res = await fetch(apiUrl('/api/pools'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to create pool');
      }

      const { pool } = await res.json();

      // Redirect to pool page
      router.push(`/pool/${pool.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Pool Name */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Pool Name
        </label>
        <input
          name="name"
          type="text"
          required
          className="input-field"
          placeholder="Super Bowl Squares 2026"
        />
      </div>

      {/* Game Name */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Game Name
        </label>
        <input
          name="game_name"
          type="text"
          required
          className="input-field"
          placeholder="Super Bowl LIX"
        />
      </div>

      {/* Game Date/Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Game Date
          </label>
          <input
            name="gameDate"
            type="date"
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Game Time
          </label>
          <input
            name="gameTime"
            type="time"
            required
            className="input-field"
          />
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Away Team
          </label>
          <input
            name="away_team"
            type="text"
            required
            className="input-field"
            placeholder="Eagles"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Home Team
          </label>
          <input
            name="home_team"
            type="text"
            required
            className="input-field"
            placeholder="Chiefs"
          />
        </div>
      </div>

      {/* Square Price & Max Squares */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Square Price ($)
          </label>
          <input
            name="square_price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue="10"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Max Squares Per User
          </label>
          <input
            name="max_squares_per_user"
            type="number"
            min="1"
            max="100"
            required
            defaultValue="10"
            className="input-field"
          />
        </div>
      </div>

      {/* Entry Fee Info */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Entry Fee Info (Optional)
        </label>
        <input
          name="entry_fee_info"
          type="text"
          className="input-field"
          placeholder="$10 per square, winner takes all"
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Visibility
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setVisibility('public')}
            className={`py-3 px-4 rounded-lg border transition-all ${
              visibility === 'public'
                ? 'bg-stadium-gold/20 border-stadium-gold text-stadium-gold'
                : 'bg-white/5 border-white/20 text-white/60'
            }`}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => setVisibility('private')}
            className={`py-3 px-4 rounded-lg border transition-all ${
              visibility === 'private'
                ? 'bg-stadium-gold/20 border-stadium-gold text-stadium-gold'
                : 'bg-white/5 border-white/20 text-white/60'
            }`}
          >
            Private
          </button>
        </div>
      </div>

      {/* Invite Code (if private) */}
      {visibility === 'private' && (
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Invite Code (Optional - auto-generated if blank)
          </label>
          <input
            name="invite_code"
            type="text"
            maxLength={8}
            className="input-field"
            placeholder="Leave blank to auto-generate"
          />
        </div>
      )}

      {/* Rules */}
      <div>
        <label className="block text-sm font-medium text-white/80 mb-2">
          Rules / Notes (Optional)
        </label>
        <textarea
          name="rules"
          rows={4}
          className="input-field resize-none"
          placeholder="Additional rules or notes for participants..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Pool...' : 'Create Pool'}
      </button>
    </form>
  );
}
