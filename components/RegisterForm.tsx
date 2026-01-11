/**
 * Registration Form Component
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiUrl } from '@/lib/utils/api';

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const emailConsent = formData.get('emailConsent') === 'on';

    const data = {
      email: formData.get('email') as string,
      password,
      name: formData.get('name') as string,
      emailConsent,
    };

    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Registration failed');
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
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

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="input-field"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input-field"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="input-field"
          placeholder="••••••••"
          minLength={8}
        />
        <p className="text-xs text-white/50 mt-1">Minimum 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/20 rounded-lg">
        <input
          id="emailConsent"
          name="emailConsent"
          type="checkbox"
          required
          className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-stadium-gold focus:ring-stadium-gold focus:ring-offset-0"
        />
        <label htmlFor="emailConsent" className="text-sm text-white/80">
          I agree to receive emails from Football Squares Pool and accept the{' '}
          <Link href="/privacy" target="_blank" className="text-stadium-gold hover:underline">
            Privacy Policy
          </Link>
          . <span className="text-red-400">*</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <p className="text-center text-white/60 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-stadium-gold hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
