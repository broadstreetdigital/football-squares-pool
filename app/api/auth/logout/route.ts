/**
 * POST /api/auth/logout
 * Clear auth cookie and redirect to homepage
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';


export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');

  // Redirect to homepage
  const url = new URL('/', request.url);
  return NextResponse.redirect(url);
}
