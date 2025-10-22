import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

/**
 * Resend client instance
 * Used for sending all emails from the application
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email sending wrapper with error handling
 * @param params - Email parameters (to, subject, react component or html)
 * @returns Promise with email send result
 */
export async function sendEmailSafely(params: {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}) {
  try {
    const from = params.from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      react: params.react,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return { success: false, error: result.error };
    }

    console.log('Email sent successfully:', result.data?.id);
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
