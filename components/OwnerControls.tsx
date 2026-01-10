/**
 * Owner Controls Component
 * Client component for pool owner actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OwnerControlsProps {
  poolId: string;
  status: 'open' | 'locked' | 'numbered' | 'completed';
  visibility: 'public' | 'private';
  inviteCode: string | null;
}

export function OwnerControls({ poolId, status, visibility, inviteCode }: OwnerControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLock = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pools/${poolId}/lock`, {
        method: 'POST',
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to lock pool');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pools/${poolId}/unlock`, {
        method: 'POST',
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to unlock pool');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pools/${poolId}/randomize`, {
        method: 'POST',
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to randomize');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="stadium-card p-6">
      <h2 className="font-display text-2xl text-white mb-4">
        OWNER CONTROLS
      </h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Actions and Invite Code Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Board Actions */}
          <div className="flex-1 flex items-center gap-4">
            {status === 'open' && (
              <button
                onClick={handleLock}
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Locking...' : 'Lock Board'}
              </button>
            )}

            {status === 'locked' && (
              <>
                <button
                  onClick={handleUnlock}
                  disabled={loading}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Unlocking...' : 'Unlock Board'}
                </button>
                <button
                  onClick={handleRandomize}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Randomizing...' : 'Randomize Digits'}
                </button>
              </>
            )}

            {(status === 'numbered' || status === 'completed') && (
              <span className="text-green-400 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Board is ready - enter scores below
              </span>
            )}
          </div>

          {/* Invite Code Section */}
          {visibility === 'private' && inviteCode && (
            <div className="lg:w-96 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">Invite Code</span>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="text-stadium-gold hover:text-stadium-gold/80 text-sm font-medium"
                >
                  {showCode ? 'Hide' : 'Show'}
                </button>
              </div>

              {showCode ? (
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black/30 px-3 py-2 rounded text-stadium-gold font-mono text-base tracking-wider">
                    {inviteCode}
                  </code>
                  <button
                    onClick={copyInviteCode}
                    className="btn-secondary py-2 px-3 text-sm"
                    title="Copy to clipboard"
                  >
                    {copied ? '✓' : 'Copy'}
                  </button>
                </div>
              ) : (
                <p className="text-white/50 text-xs">
                  Click "Show" to reveal invite code
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
