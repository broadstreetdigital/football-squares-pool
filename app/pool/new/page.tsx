/**
 * Create Pool Page
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/lib/auth/session';
import { CreatePoolForm } from '@/components/CreatePoolForm';

export default async function NewPoolPage() {
  const session = await requireAuth().catch(() => null);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-turf-gradient bg-yard-pattern">
      {/* Stadium lights effect */}
      <div className="fixed inset-0 bg-stadium-lights pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6 border-b border-white/10">
        <div className="flex justify-between items-center">
          <Link href="/" className="font-display text-2xl sm:text-3xl text-stadium-gold leading-none flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="Football" className="w-16 h-16 sm:w-10 sm:h-10 flex-shrink-0" />
            <span className="leading-[1.1]">FOOTBALL<br className="sm:hidden" /> SQUARES POOL</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="btn-secondary">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-white/60 hover:text-white text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="stadium-card p-8">
            <h1 className="font-display text-4xl text-white mb-2">
              CREATE NEW POOL
            </h1>
            <p className="text-white/60 mb-8">
              Set up a new football squares pool for your game
            </p>

            <CreatePoolForm />
          </div>
        </div>
      </main>
    </div>
  );
}
