import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/components';
import TestEmail from '@/emails/templates/TestEmail';
import { sendEmail } from '@/lib/email/helpers';
import { EmailType } from '@/lib/email/config';

/**
 * Test Email API Route
 * Send a test email to verify the email system is working
 *
 * Usage: POST /api/test-email
 * Body: { "to": "your-email@example.com", "name": "Your Name" }
 *
 * DISABLED IN PRODUCTION FOR SECURITY
 */
export async function POST(request: NextRequest) {
  // Disable in production to prevent email spam/abuse
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is disabled in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { to, name } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Render the email template
    const emailHtml = await render(
      TestEmail({ customerName: name || 'Valued Customer' })
    );

    // Send the email
    const result = await sendEmail(
      to,
      'Test Email from Dream Azul',
      emailHtml,
      undefined, // No plain text version for now
      EmailType.PROMOTIONAL
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        emailId: result.emailId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}

/**
 * GET method to check if the endpoint is working
 */
export async function GET() {
  return NextResponse.json({
    message: 'Test email endpoint is active',
    usage: 'POST to this endpoint with { "to": "email@example.com", "name": "Name" }',
  });
}
