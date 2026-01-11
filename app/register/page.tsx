/**
 * Registration Page
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { RegisterForm } from '@/components/RegisterForm';

export default async function RegisterPage() {
  // Redirect if already logged in
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-turf-gradient bg-yard-pattern">
      {/* Stadium lights effect */}
      <div className="fixed inset-0 bg-stadium-lights pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <Link href="/" className="font-display text-2xl sm:text-3xl text-stadium-gold leading-tight">
          FOOTBALL<br className="sm:hidden" /> SQUARES POOL
        </Link>
      </nav>

      {/* Register Form */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="stadium-card p-8">
            <h1 className="font-display text-4xl text-white mb-2 text-center">
              SIGN UP
            </h1>
            <p className="text-white/60 text-center mb-8">
              Create your Football Squares account
            </p>

            <RegisterForm />
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-white/60 hover:text-white text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
