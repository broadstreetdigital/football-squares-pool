import type { Metadata } from 'next';
import { Inter, Teko } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const teko = Teko({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-teko',
});

export const metadata: Metadata = {
  title: 'Football Squares Pool',
  description: 'Create and manage football squares pools for game day',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${teko.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
