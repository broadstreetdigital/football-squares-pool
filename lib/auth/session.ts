/**
 * Session management via cookies
 */

import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './jwt';

const AUTH_COOKIE_NAME = 'auth_token';

export interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Get current session from cookie
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  return {
    user: {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    },
  };
}

/**
 * Require authentication - throws if not logged in
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * Get cookie options
 */
export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  };
}
