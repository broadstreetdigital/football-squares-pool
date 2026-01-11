/**
 * Owner Controls Component
 * Client component for pool owner actions
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

interface OwnerControlsProps {
  poolId: string;
  status: 'open' | 'locked' | 'numbered' | 'completed';
}

export function OwnerControls({ poolId, status }: OwnerControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRandomizeConfirm, setShowRandomizeConfirm] = useState(false);
  const [showUnrandomizeConfirm, setShowUnrandomizeConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setShowRandomizeConfirm(false);

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

  const handleUnrandomize = async () => {
    setLoading(true);
    setError(null);
    setShowUnrandomizeConfirm(false);

    try {
      const res = await fetch(`/api/pools/${poolId}/unrandomize`, {
        method: 'POST',
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to un-randomize pool');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
        {/* Board Actions */}
        <div className="flex items-center gap-4">
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
                onClick={() => setShowRandomizeConfirm(true)}
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Randomize Digits
              </button>
            </>
          )}

          {status === 'numbered' && (
            <>
              <button
                onClick={() => setShowUnrandomizeConfirm(true)}
                disabled={loading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Un-randomize
              </button>
              <span className="text-green-400 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Board is ready - enter scores below
              </span>
            </>
          )}

          {status === 'completed' && (
            <span className="text-green-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Board is ready - enter scores below
            </span>
          )}
        </div>
      </div>

      {/* Randomize Confirmation Dialog */}
      {mounted && showRandomizeConfirm && createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-gradient-to-br from-green-900/95 to-green-800/95 border-2 border-stadium-gold rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-2xl text-white mb-4">
              Randomize Digits?
            </h3>
            <p className="text-white/90 mb-6">
              Are you sure you want to randomize the digits? Once the digits have been randomized, the board will be ready and numbers will be assigned to each row and column.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRandomizeConfirm(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRandomize}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Randomizing...' : 'Yes, Randomize'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Un-randomize Confirmation Dialog */}
      {mounted && showUnrandomizeConfirm && createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-gradient-to-br from-green-900/95 to-green-800/95 border-2 border-stadium-gold rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-2xl text-white mb-4">
              Un-randomize Board?
            </h3>
            <p className="text-white/90 mb-6">
              Are you sure you want to remove the digit assignments? This will clear the numbers from the board and allow you to randomize again or unlock the board for more players to join.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUnrandomizeConfirm(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUnrandomize}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Yes, Un-randomize'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
