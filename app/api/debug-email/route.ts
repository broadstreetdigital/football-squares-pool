/**
 * Debug email endpoint
 * POST /api/debug-email
 * Test all email functions with detailed error reporting
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail, sendPoolCreatedEmail } from '@/lib/email/sendgrid';

export async function POST(request: NextRequest) {
  const results: any = {
    config: {
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    },
    tests: {},
  };

  const body = await request.json();
  const testEmail = body.email || 'test@example.com';

  // Test 1: Welcome Email
  try {
    await sendWelcomeEmail({
      email: testEmail,
      name: 'Test User',
    });
    results.tests.welcomeEmail = { success: true, error: null };
  } catch (error: any) {
    results.tests.welcomeEmail = {
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
        response: error.response?.body,
      },
    };
  }

  // Test 2: Pool Created Email
  try {
    await sendPoolCreatedEmail({
      email: testEmail,
      managerName: 'Test Manager',
      poolName: 'Test Pool',
      poolId: 'test-123',
      gameDate: 'Sunday, February 9, 2026',
      maxSquares: 10,
      visibility: 'public',
    });
    results.tests.poolCreatedEmail = { success: true, error: null };
  } catch (error: any) {
    results.tests.poolCreatedEmail = {
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
        response: error.response?.body,
      },
    };
  }

  return NextResponse.json(results, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
