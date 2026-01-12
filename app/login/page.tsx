/**
 * Login Page
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { LoginForm } from '@/components/LoginForm';

export default async function LoginPage() {
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
        <Link href="/" className="font-display text-xl sm:text-4xl text-stadium-gold leading-[0.9] flex items-center gap-2 sm:gap-3">
          <img src="/logo.png" alt="Football" className="w-16 h-16 sm:w-10 sm:h-10 flex-shrink-0" />
          <span className="leading-[0.9]">SQUARES<br className="sm:hidden" /> POOL</span>
        </Link>
      </nav>

      {/* Login Form */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="stadium-card p-8">
            <h1 className="font-display text-4xl text-white mb-2 text-center">
              LOG IN
            </h1>
            <p className="text-white/60 text-center mb-8">
              Welcome back to Football Squares Pool
            </p>

            <LoginForm />
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
