/**
 * Share Link Component with Copy-to-Clipboard
 */

'use client';

import { useState } from 'react';

interface ShareLinkProps {
  poolId: string;
}

export function ShareLink({ poolId }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

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

  return (
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
  );
}
