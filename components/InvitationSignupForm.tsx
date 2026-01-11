/**
 * Invitation Signup Form
 * Form for completing account setup from a pool invitation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InvitationSignupFormProps {
  invitationToken: string;
  email: string;
  name: string;
  poolId: string;
}

export function InvitationSignupForm({
  invitationToken,
  email,
  name,
  poolId,
}: InvitationSignupFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailConsent, setEmailConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate passwords
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Complete invitation signup
      const res = await fetch('/api/auth/complete-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationToken,
          password,
          emailConsent,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to complete signup');
      }

      // Redirect to pool
      router.push(`/pool/${poolId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-display text-xl text-white mb-4">
          Complete Your Account
        </h3>
        <p className="text-white/70 text-sm mb-6">
          Set a password to secure your account and access the pool.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-white/80 text-sm mb-2">
          Name
        </label>
        <input
          type="text"
          value={name}
          disabled
          className="input-field w-full opacity-60 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="input-field w-full opacity-60 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-2">
          Password *
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a secure password"
          className="input-field w-full"
          required
          minLength={8}
          disabled={loading}
        />
        <p className="text-white/50 text-xs mt-1">
          Must be at least 8 characters
        </p>
      </div>

      <div>
        <label className="block text-white/80 text-sm mb-2">
          Confirm Password *
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="input-field w-full"
          required
          minLength={8}
          disabled={loading}
        />
      </div>

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={emailConsent}
            onChange={(e) => setEmailConsent(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-stadium-gold focus:ring-stadium-gold focus:ring-offset-0"
            disabled={loading}
          />
          <span className="text-white/80 text-sm">
            I agree to receive email updates about this pool (game reminders, board updates, etc.)
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Complete Signup & View Pool'}
      </button>

      <p className="text-white/50 text-xs text-center">
        By completing signup, you agree to our terms of service and privacy policy.
      </p>
    </form>
  );
}
