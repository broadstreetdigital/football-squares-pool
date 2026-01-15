/**
 * Send test email endpoint
 * POST /api/send-test-email
 * Body: { "email": "test@example.com" }
 */

import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email address required in request body' },
        { status: 400 }
      );
    }

    // Check environment variables
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'SENDGRID_API_KEY not configured',
          details: 'Add SENDGRID_API_KEY to your environment variables',
        },
        { status: 500 }
      );
    }

    if (!fromEmail) {
      return NextResponse.json(
        {
          error: 'SENDGRID_FROM_EMAIL not configured',
          details: 'Add SENDGRID_FROM_EMAIL to your environment variables',
        },
        { status: 500 }
      );
    }

    // Set API key
    sgMail.setApiKey(apiKey);

    // Send test email
    const msg = {
      to: email,
      from: fromEmail,
      subject: 'Test Email from Football Squares Pool',
      text: 'This is a test email to verify SendGrid integration is working.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email Success!</h2>
          <p>This is a test email to verify SendGrid integration is working.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>From: ${fromEmail}</li>
            <li>To: ${email}</li>
            <li>API Key: ${apiKey.substring(0, 10)}...</li>
          </ul>
          <p>If you received this email, your SendGrid integration is working correctly!</p>
        </div>
      `,
    };

    const response = await sgMail.send(msg);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      to: email,
      from: fromEmail,
      sendgridResponse: {
        statusCode: response[0].statusCode,
        headers: response[0].headers,
      },
    });
  } catch (error: any) {
    console.error('SendGrid test error:', error);

    // Extract detailed error information
    let errorDetails = {
      message: error.message || 'Unknown error',
      code: error.code,
      response: null as any,
    };

    if (error.response) {
      errorDetails.response = {
        statusCode: error.response.statusCode,
        body: error.response.body,
        headers: error.response.headers,
      };
    }

    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
