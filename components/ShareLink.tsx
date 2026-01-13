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

  // Remove https://www. or https:// for display only
  const displayUrl = shareUrl.replace(/^https?:\/\/(www\.)?/, '');

  const handleCopy = async () => {
    try {
      // Copy the full URL with https://
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-2 lg:col-span-2">
        <label className="block text-sm font-medium text-white/80">
          Share this pool
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayUrl}
            readOnly
            className="input-field flex-1 text-sm"
            onFocus={(e) => {
              // When user selects text, copy the full URL
              e.target.value = shareUrl;
              e.target.select();
            }}
            onBlur={(e) => {
              // Restore display URL when focus is lost
              e.target.value = displayUrl;
            }}
          />
          <button
            onClick={handleCopy}
            className={`btn-secondary px-4 py-2 whitespace-nowrap md:inline-flex hidden ${
              copied ? 'bg-green-500/20 text-green-300' : ''
            }`}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          {/* Icon button for mobile */}
          <button
            onClick={handleCopy}
            className={`btn-secondary p-2 md:hidden ${
              copied ? 'bg-green-500/20 text-green-300' : ''
            }`}
            title="Copy link"
          >
            {copied ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Invite Code Section - Only for private pools and owners */}
      {isOwner && visibility === 'private' && inviteCode && (
        <div className="space-y-2 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
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
