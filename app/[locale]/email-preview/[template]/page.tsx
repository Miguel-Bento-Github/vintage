'use client';

import { useState } from 'react';
import { render } from '@react-email/components';
import TestEmail from '@/emails/templates/TestEmail';

interface EmailPreviewTemplatePageProps {
  params: Promise<{
    template: string;
    locale: string;
  }>;
}

/**
 * Individual Email Template Preview
 * Renders a specific email template for testing
 */
export default function EmailPreviewTemplatePage({
  params,
}: EmailPreviewTemplatePageProps) {
  const [emailHtml, setEmailHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendStatus, setSendStatus] = useState<string>('');

  // Unwrap params and render email
  useState(() => {
    params.then(({ template }) => {
      renderTemplate(template);
    });
  });

  const renderTemplate = async (templateName: string) => {
    try {
      let emailComponent;

      // Map template names to components
      switch (templateName) {
        case 'test':
        default:
          emailComponent = TestEmail({ customerName: 'John Doe' });
          break;
        // Add more cases as templates are created
      }

      const html = await render(emailComponent);
      setEmailHtml(html);
    } catch (error) {
      console.error('Error rendering email:', error);
      setEmailHtml('<p>Error rendering email template</p>');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!emailAddress) {
      setSendStatus('Please enter an email address');
      return;
    }

    setSendStatus('Sending...');

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailAddress,
          name: 'Test User',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSendStatus('✓ Email sent successfully!');
        setTimeout(() => setSendStatus(''), 3000);
      } else {
        setSendStatus(`✗ Error: ${result.error}`);
      }
    } catch (error) {
      setSendStatus('✗ Failed to send email');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading email preview...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Email Preview</h1>
            <button
              onClick={() => setSendEmail(!sendEmail)}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800"
            >
              {sendEmail ? 'Hide Send Form' : 'Send Test Email'}
            </button>
          </div>

          {sendEmail && (
            <div className="border-t pt-4 mt-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send test email to:
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSendTestEmail}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Send
                </button>
              </div>
              {sendStatus && (
                <p className="mt-2 text-sm text-gray-600">{sendStatus}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Note: With onboarding@resend.dev, you can only send to your Resend
                account email.
              </p>
            </div>
          )}
        </div>

        {/* Email Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              dangerouslySetInnerHTML={{ __html: emailHtml }}
              className="email-preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
