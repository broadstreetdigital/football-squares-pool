/**
 * Share Link Component with Copy-to-Clipboard
 */

'use client';

import { useState } from 'react';

interface ShareLinkProps {
  poolId: string;
  isOwner?: boolean;
  visibility?: 'public' | 'private';
  inviteCode?: string | null;
}

export function ShareLink({ poolId, isOwner, visibility, inviteCode }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/pool/${poolId}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyCode = async () => {
    if (inviteCode) {
      try {
        await navigator.clipboard.writeText(inviteCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Share this pool
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="input-field flex-1 text-sm"
          />
          <button
            onClick={handleCopy}
            className={`btn-secondary px-4 py-2 whitespace-nowrap ${
              copied ? 'bg-green-500/20 text-green-300' : ''
            }`}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Invite Code Section - Only for private pools and owners */}
      {isOwner && visibility === 'private' && inviteCode && (
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
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
                onClick={handleCopyCode}
                className={`btn-secondary py-2 px-3 text-sm ${
                  codeCopied ? 'bg-green-500/20 text-green-300' : ''
                }`}
                title="Copy to clipboard"
              >
                {codeCopied ? '✓' : 'Copy'}
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
  );
}
