/**
 * Test email endpoint
 * GET /api/test-email
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check environment variables
  const hasApiKey = !!process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Test SendGrid import
  let sgMailImported = false;
  try {
    const sgMail = await import('@sendgrid/mail');
    sgMailImported = true;
  } catch (error) {
    sgMailImported = false;
  }

  return NextResponse.json({
    status: 'Email Configuration Check',
    environment: process.env.NODE_ENV,
    config: {
      hasApiKey,
      apiKeyPrefix: hasApiKey ? process.env.SENDGRID_API_KEY?.substring(0, 10) + '...' : 'NOT SET',
      fromEmail: fromEmail || 'NOT SET',
      siteUrl: siteUrl || 'NOT SET',
      sgMailImported,
    },
    recommendation: !hasApiKey
      ? 'Set SENDGRID_API_KEY in your environment variables'
      : !fromEmail
      ? 'Set SENDGRID_FROM_EMAIL in your environment variables'
      : 'Configuration looks good. Try sending a test email.',
  });
}
