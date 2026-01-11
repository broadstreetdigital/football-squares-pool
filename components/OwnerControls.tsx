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
  squarePrice: number;
  maxSquaresPerUser: number;
  squares?: Array<{
    row: number;
    col: number;
    claimed_by_user_id: string | null;
    claimed_display_name: string | null;
  }>;
}

export function OwnerControls({ poolId, status, squarePrice, maxSquaresPerUser, squares }: OwnerControlsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRandomizeConfirm, setShowRandomizeConfirm] = useState(false);
  const [showUnrandomizeConfirm, setShowUnrandomizeConfirm] = useState(false);
  const [showClearBoardConfirm, setShowClearBoardConfirm] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showEditBoardDialog, setShowEditBoardDialog] = useState(false);
  const [newSquarePrice, setNewSquarePrice] = useState(squarePrice.toString());
  const [newMaxSquares, setNewMaxSquares] = useState(maxSquaresPerUser.toString());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update local state when props change (after refresh)
  useEffect(() => {
    setNewSquarePrice(squarePrice.toString());
    setNewMaxSquares(maxSquaresPerUser.toString());
  }, [squarePrice, maxSquaresPerUser]);

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

  const handleUpdateSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const price = parseFloat(newSquarePrice);
      const max = parseInt(newMaxSquares);

      if (isNaN(price) || price < 0) {
        throw new Error('Invalid square price');
      }

      if (isNaN(max) || max < 1 || max > 100) {
        throw new Error('Max squares must be between 1 and 100');
      }

      const res = await fetch(`/api/pools/${poolId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          square_price: price,
          max_squares_per_user: max,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to update settings');
      }

      setShowSettingsDialog(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClearBoard = async () => {
    setLoading(true);
    setError(null);
    setShowClearBoardConfirm(false);

    try {
      const res = await fetch(`/api/pools/${poolId}/clear`, {
        method: 'POST',
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to clear board');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClaim = async (row: number, col: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pools/${poolId}/board`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row, col }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to remove claim');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const claimedSquares = squares?.filter(s => s.claimed_by_user_id || s.claimed_display_name) || [];

  return (
    <div className="stadium-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-white">
          MANAGER CONTROLS
        </h2>

        {/* Board Ready Status */}
        {(status === 'numbered' || status === 'completed') && (
          <span className="text-green-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Board is ready - enter scores below
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Board Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Settings Button - Always first */}
          <button
            onClick={() => setShowSettingsDialog(true)}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pool Settings
          </button>

          {/* Edit Board Button - Available in all states */}
          <button
            onClick={() => setShowEditBoardDialog(true)}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Edit Board
          </button>

          {/* Status-specific buttons */}
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
            <button
              onClick={() => setShowUnrandomizeConfirm(true)}
              disabled={loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Un-randomize
            </button>
          )}

          {/* Clear Board Button - Available in all states */}
          <button
            onClick={() => setShowClearBoardConfirm(true)}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed bg-red-500/20 hover:bg-red-500/30 border-red-500/50"
          >
            Clear Board
          </button>
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

      {/* Settings Dialog */}
      {mounted && showSettingsDialog && createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-gradient-to-br from-green-900/95 to-green-800/95 border-2 border-stadium-gold rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-2xl text-white mb-4">
              Pool Settings
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Square Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newSquarePrice}
                  onChange={(e) => setNewSquarePrice(e.target.value)}
                  className="input-field w-full"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Max Squares Per User (1-100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newMaxSquares}
                  onChange={(e) => setNewMaxSquares(e.target.value)}
                  className="input-field w-full"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSettingsDialog(false);
                  setNewSquarePrice(squarePrice.toString());
                  setNewMaxSquares(maxSquaresPerUser.toString());
                  setError(null);
                }}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSettings}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Clear Board Confirmation Dialog */}
      {mounted && showClearBoardConfirm && createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-gradient-to-br from-green-900/95 to-green-800/95 border-2 border-red-500 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-display text-2xl text-white mb-4">
              Clear Board?
            </h3>
            <p className="text-white/90 mb-6">
              Are you sure you want to clear the board? This will remove ALL claimed squares from all users. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearBoardConfirm(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleClearBoard}
                className="btn-primary bg-red-500/80 hover:bg-red-500 border-red-500"
                disabled={loading}
              >
                {loading ? 'Clearing...' : 'Yes, Clear Board'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Board Dialog */}
      {mounted && showEditBoardDialog && createPortal(
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-gradient-to-br from-green-900/95 to-green-800/95 border-2 border-stadium-gold rounded-lg p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="font-display text-2xl text-white mb-4">
              Edit Board
            </h3>

            <p className="text-white/80 text-sm mb-4">
              Click on any claimed square to remove that claim.
            </p>

            {claimedSquares.length === 0 ? (
              <div className="text-white/60 text-center py-8">
                No squares have been claimed yet.
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 mb-4">
                <div className="grid grid-cols-1 gap-2">
                  {claimedSquares.map((square) => (
                    <button
                      key={`${square.row}-${square.col}`}
                      onClick={() => {
                        if (window.confirm(`Remove claim for square (${square.row}, ${square.col}) claimed by ${square.claimed_display_name}?`)) {
                          handleRemoveClaim(square.row, square.col);
                          setShowEditBoardDialog(false);
                        }
                      }}
                      disabled={loading}
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-stadium-gold/50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div>
                        <span className="text-white font-semibold">
                          Square ({square.row}, {square.col})
                        </span>
                        <span className="text-white/60 text-sm block">
                          Claimed by: {square.claimed_display_name}
                        </span>
                      </div>
                      <span className="text-red-400 text-sm font-medium">Remove</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  setShowEditBoardDialog(false);
                  setError(null);
                }}
                className="btn-secondary"
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
