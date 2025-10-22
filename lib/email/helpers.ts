import { sendEmailSafely } from '../resend';
import { EmailType, getFromAddress } from './config';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Email send result interface
 */
interface EmailResult {
  success: boolean;
  emailId?: string;
  error?: string;
}

/**
 * Send email wrapper function
 * Handles sending emails with proper error handling and logging
 *
 * @param to - Recipient email address(es)
 * @param subject - Email subject line
 * @param html - HTML content of the email
 * @param text - Plain text version of the email (optional)
 * @param emailType - Type of email for logging and analytics
 * @param metadata - Additional metadata to log
 * @returns Promise with email send result
 */
export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string,
  emailType?: EmailType,
  metadata?: Record<string, unknown>
): Promise<EmailResult> {
  // Validate email addresses
  const recipients = Array.isArray(to) ? to : [to];
  const validRecipients = recipients.filter(email => validateEmailAddress(email));

  if (validRecipients.length === 0) {
    console.error('No valid email addresses provided');
    return { success: false, error: 'No valid email addresses' };
  }

  // Determine from address based on email type
  let fromAddress = getFromAddress('orders');
  if (emailType) {
    if (emailType.includes('cart') || emailType.includes('arrival') || emailType.includes('promotional')) {
      fromAddress = getFromAddress('marketing');
    } else if (emailType.includes('order') || emailType.includes('shipping')) {
      fromAddress = getFromAddress('orders');
    }
  }

  // Send email
  const result = await sendEmailSafely({
    to: validRecipients,
    subject,
    html,
    text,
    from: fromAddress,
  });

  // Log email send attempt
  if (emailType) {
    await logEmailSent(
      emailType,
      validRecipients[0], // Primary recipient for logging
      result.success ? 'sent' : 'failed',
      {
        subject,
        error: result.error,
        emailId: result.data?.id,
        ...metadata,
      }
    );
  }

  return {
    success: result.success,
    emailId: result.data?.id,
    error: result.error as string,
  };
}

/**
 * Format email address with name
 * @param name - Name to display
 * @param email - Email address
 * @returns Formatted email address (e.g., "John Doe <john@example.com>")
 */
export function formatEmailAddress(name: string, email: string): string {
  if (!name) return email;
  return `${name} <${email}>`;
}

/**
 * Validate email address format
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function validateEmailAddress(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Log email sent to Firestore for analytics
 * @param emailType - Type of email sent
 * @param recipient - Recipient email address
 * @param status - Send status (sent, failed, bounced, etc.)
 * @param metadata - Additional metadata to store
 */
export async function logEmailSent(
  emailType: EmailType | string,
  recipient: string,
  status: 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened' | 'clicked',
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await addDoc(collection(db, 'emailAnalytics'), {
      emailType,
      recipientEmail: recipient,
      status,
      sentAt: serverTimestamp(),
      metadata: metadata || {},
      // Analytics fields
      opened: false,
      clicked: false,
      bounced: status === 'bounced',
      delivered: status === 'delivered',
    });
  } catch (error) {
    console.error('Failed to log email send:', error);
    // Don't throw - logging failure shouldn't break email sending
  }
}

/**
 * Batch send emails with rate limiting
 * Useful for sending marketing emails to multiple recipients
 *
 * @param recipients - Array of email addresses
 * @param subject - Email subject
 * @param htmlTemplate - Function that generates HTML for each recipient
 * @param emailType - Type of email
 * @param batchSize - Number of emails to send in each batch
 * @param delayMs - Delay between batches in milliseconds
 */
export async function batchSendEmails(
  recipients: string[],
  subject: string,
  htmlTemplate: (email: string) => string,
  emailType: EmailType,
  batchSize: number = 50,
  delayMs: number = 1000
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    // Send emails in parallel within batch
    const results = await Promise.allSettled(
      batch.map(email =>
        sendEmail(
          email,
          subject,
          htmlTemplate(email),
          undefined,
          emailType
        )
      )
    );

    // Count successes and failures
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        sent++;
      } else {
        failed++;
      }
    });

    // Delay before next batch (except for last batch)
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log(`Batch email send complete: ${sent} sent, ${failed} failed`);
  return { sent, failed };
}

/**
 * Generate email preview text (for email clients that show preview)
 * @param text - Full text to create preview from
 * @param maxLength - Maximum length of preview (default 150)
 * @returns Preview text
 */
export function generatePreviewText(text: string, maxLength: number = 150): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength).trim() + '...';
}

/**
 * Create tracking pixel URL for email opens
 * @param emailId - Unique email ID
 * @returns URL for tracking pixel
 */
export function getTrackingPixelUrl(emailId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/track/open/${emailId}.png`;
}

/**
 * Create tracking URL for email link clicks
 * @param emailId - Unique email ID
 * @param destinationUrl - Actual destination URL
 * @returns Tracking URL that redirects to destination
 */
export function getTrackingClickUrl(emailId: string, destinationUrl: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    url: destinationUrl,
  });
  return `${baseUrl}/api/track/click/${emailId}?${params.toString()}`;
}
