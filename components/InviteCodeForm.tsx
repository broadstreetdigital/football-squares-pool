/**
 * Invite Code Form Component
 * For joining private pools
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/utils/api';

interface InviteCodeFormProps {
  poolId: string;
  poolName: string;
}

export function InviteCodeForm({ poolId, poolName }: InviteCodeFormProps) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl(`/api/pools/${poolId}/join`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Invalid invite code');
      }

      // Refresh the page to show the pool content
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="stadium-card p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-stadium-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-stadium-gold"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-white mb-2">
            Private Pool
          </h2>
          <p className="text-white/60">
            "{poolName}" is a private pool. Enter the invite code to access.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="invite-code"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Invite Code
            </label>
            <input
              id="invite-code"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={8}
              required
              className="input-field text-center text-lg tracking-wider font-mono"
              placeholder="XXXXXXXX"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || inviteCode.length !== 8}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Join Pool'}
          </button>
        </form>
      </div>
    </div>
  );
}
