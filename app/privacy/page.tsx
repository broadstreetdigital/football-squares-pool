/**
 * Privacy Policy Page
 */

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-turf-gradient">
      {/* Stadium lights effect */}
      <div className="fixed inset-0 bg-stadium-lights pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6 border-b border-white/10">
        <Link href="/" className="font-display text-2xl sm:text-3xl text-stadium-gold leading-tight">
          FOOTBALL SQUARES POOL
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto stadium-card p-8">
          <h1 className="font-display text-4xl text-white mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-white/80">
            <p className="text-sm text-white/60">
              <strong>Last Updated:</strong> January 11, 2026
            </p>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">1. Introduction</h2>
              <p>
                Welcome to Football Squares Pool ("we," "our," or "us"). We are committed to protecting your
                privacy and being transparent about how we collect, use, and share information about you. This
                Privacy Policy explains how we handle your personal information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">2. Information We Collect</h2>
              <p className="mb-3">
                We collect the following types of information when you use our service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Account Information:</strong> When you create an account, we collect your name, email
                  address, and password (stored securely using industry-standard encryption).
                </li>
                <li>
                  <strong>Pool Information:</strong> Information about the football squares pools you create or
                  join, including team names, game details, and square claims.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you use our service, including your IP address,
                  browser type, device information, and pages visited.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To provide, maintain, and improve our service</li>
                <li>To create and manage your account</li>
                <li>To facilitate the creation and management of football squares pools</li>
                <li>To communicate with you about your account and pools</li>
                <li>
                  <strong>To send you email communications</strong> if you have provided your email address and
                  consented to receive such communications, including pool notifications, updates, and promotional
                  content
                </li>
                <li>To analyze usage patterns and improve user experience</li>
                <li>To detect, prevent, and address technical issues or fraudulent activity</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">4. Email Communications</h2>
              <p>
                If you provide your email address during signup and consent to receive emails, we may send you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Account-related notifications and updates</li>
                <li>Pool activity notifications (new claims, score updates, winners)</li>
                <li>Service announcements and updates</li>
                <li>Promotional content and feature highlights</li>
              </ul>
              <p className="mt-3">
                You can opt out of promotional emails at any time by contacting us, though we may still send you
                essential account-related communications.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">5. Cookies and Analytics</h2>
              <p>
                By visiting and using our website, you agree to our use of cookies and analytics technologies.
                We use:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>
                  <strong>Essential Cookies:</strong> Required for authentication and basic functionality of the
                  service (such as maintaining your login session).
                </li>
                <li>
                  <strong>Analytics:</strong> We may use analytics services to understand how users interact with
                  our service, helping us improve functionality and user experience.
                </li>
              </ul>
              <p className="mt-3">
                These technologies help us provide a better, more personalized experience.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">6. Information Sharing</h2>
              <p>
                We do not sell, rent, or trade your personal information. We may share your information only in
                the following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>
                  <strong>Within Pools:</strong> Your display name and claimed squares are visible to other
                  participants in pools you join.
                </li>
                <li>
                  <strong>Service Providers:</strong> With trusted third-party service providers who assist in
                  operating our service (e.g., hosting, email delivery) under strict confidentiality agreements.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights, property,
                  or safety.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">7. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Encrypted storage of passwords using bcrypt</li>
                <li>Secure HTTPS connections for all data transmission</li>
                <li>JWT-based authentication with httpOnly cookies</li>
                <li>Regular security reviews and updates</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">8. Your Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Withdraw consent for email communications</li>
                <li>Export your data in a portable format</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us at the email address below.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">9. Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide
                you services. If you request account deletion, we will delete your personal information within
                30 days, except where retention is required by law or for legitimate business purposes (such as
                resolving disputes or enforcing agreements).
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">10. Children's Privacy</h2>
              <p>
                Our service is not directed to children under the age of 13. We do not knowingly collect personal
                information from children under 13. If you believe we have collected information from a child
                under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes
                by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued
                use of the service after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-stadium-gold mb-4">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="mt-3">
                <strong>Email:</strong> privacy@footballsquarespool.com
              </p>
            </section>

            <section className="pt-6 border-t border-white/10">
              <p className="text-sm text-white/60">
                By using Football Squares Pool, you acknowledge that you have read and understood this Privacy
                Policy and agree to its terms, including the use of cookies and analytics as described herein.
              </p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-stadium-gold hover:text-stadium-gold-light">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 mt-12 border-t border-white/10">
        <p className="text-center text-white/50 text-sm">
          © 2026 Football Squares Pool • Built for game day fun
        </p>
      </footer>
    </div>
  );
}
