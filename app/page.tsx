/**
 * Landing Page
 */

import Link from 'next/link';
import { getSession } from '@/lib/auth/session';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-football-field relative">
      {/* Stadium lights effect */}
      <div className="fixed inset-0 bg-stadium-lights pointer-events-none" />

      {/* Yard Marker - Vertical along left side */}
      <div className="fixed left-0 top-0 bottom-0 w-12 pointer-events-none z-0">
        {/* Yard marker background */}
        <div className="absolute inset-0 bg-white/5 border-r-2 border-white/20" />

        {/* Yard numbers */}
        <div className="absolute inset-0 flex flex-col justify-around py-8">
          {[10, 20, 30, 40, 50, 40, 30, 20, 10].map((yard, idx) => (
            <div key={idx} className="relative h-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xl text-white/30 rotate-0">{yard}</span>
              </div>
              {/* Tick mark */}
              <div className="absolute right-0 top-1/2 w-4 h-0.5 bg-white/40" />
            </div>
          ))}
        </div>
      </div>


      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex flex-row justify-between items-center gap-4">
          <h1 className="font-display text-3xl sm:text-4xl text-stadium-gold leading-tight">
            FOOTBALL<br className="sm:hidden" /> SQUARES POOL
          </h1>

          <div className="flex flex-wrap gap-2 sm:gap-4 justify-end">
            {session ? (
              <>
                <Link href="/dashboard" className="btn-secondary text-sm sm:text-base">
                  Dashboard
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="btn-secondary text-sm sm:text-base">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm sm:text-base">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-sm sm:text-base">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-5xl sm:text-7xl text-white mb-6 leading-tight">
            EASILY CREATE YOUR SQUARES POOL
            <br />
            <span className="text-stadium-gold">FOR THE BIG GAME</span>
          </h2>

          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Create and manage football squares pools for your Super Bowl party,
            playoff games, or any matchup. Easy setup, fair randomization, and
            instant winner calculations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={session ? '/pool/new' : '/register'} className="btn-primary text-lg">
              Create a Pool
            </Link>
            <Link href="/demo" className="btn-secondary text-lg">
              View a Demo
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="mt-24 max-w-5xl mx-auto">
          <h3 className="font-display text-4xl text-center text-stadium-gold mb-12">
            HOW IT WORKS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="stadium-card p-6">
              <div className="w-12 h-12 rounded-full bg-stadium-gold flex items-center justify-center text-turf-900 font-display text-2xl mb-4">
                1
              </div>
              <h4 className="font-display text-xl text-white mb-2">CREATE</h4>
              <p className="text-white/70">
                Set up your pool with game details, entry fee, and rules. Choose public or private.
              </p>
            </div>

            {/* Step 2 */}
            <div className="stadium-card p-6">
              <div className="w-12 h-12 rounded-full bg-stadium-gold flex items-center justify-center text-turf-900 font-display text-2xl mb-4">
                2
              </div>
              <h4 className="font-display text-xl text-white mb-2">SHARE</h4>
              <p className="text-white/70">
                Invite participants with a shareable link. They claim squares on the 10x10 grid.
              </p>
            </div>

            {/* Step 3 */}
            <div className="stadium-card p-6">
              <div className="w-12 h-12 rounded-full bg-stadium-gold flex items-center justify-center text-turf-900 font-display text-2xl mb-4">
                3
              </div>
              <h4 className="font-display text-xl text-white mb-2">RANDOMIZE</h4>
              <p className="text-white/70">
                Lock the board and randomize digits for X/Y axes. Fair and transparent.
              </p>
            </div>

            {/* Step 4 */}
            <div className="stadium-card p-6">
              <div className="w-12 h-12 rounded-full bg-stadium-gold flex items-center justify-center text-turf-900 font-display text-2xl mb-4">
                4
              </div>
              <h4 className="font-display text-xl text-white mb-2">WATCH</h4>
              <p className="text-white/70">
                Track scores by quarter. Winners are calculated instantly based on last digits.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-24 max-w-4xl mx-auto">
          <div className="stadium-card p-8">
            <h3 className="font-display text-3xl text-stadium-gold mb-6 text-center">
              FEATURES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-stadium-gold mt-2" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Cryptographically Random</h4>
                  <p className="text-white/70 text-sm">
                    Secure randomization using Web Crypto API ensures fairness
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-stadium-gold mt-2" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Public or Private Pools</h4>
                  <p className="text-white/70 text-sm">
                    Share openly or use invite codes for private groups
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-stadium-gold mt-2" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Mobile Friendly</h4>
                  <p className="text-white/70 text-sm">
                    Responsive design works on phones, tablets, and desktops
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-stadium-gold mt-2" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Instant Winners</h4>
                  <p className="text-white/70 text-sm">
                    Automatic winner calculation for Q1, Q2, Q3, Q4, and Final
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 mt-24 border-t border-white/10">
        <p className="text-center text-white/50 text-sm">
          © 2026 Football Squares Pool • Built for game day fun
        </p>
      </footer>
    </div>
  );
}
