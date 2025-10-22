import { Suspense } from 'react';
import Link from 'next/link';

/**
 * Email Preview Page
 * View and test email templates in the browser during development
 */
export default function EmailPreviewPage() {
  const templates = [
    {
      name: 'Order Confirmation',
      slug: 'order-confirmation',
      description: 'Sent immediately after a successful purchase',
    },
    {
      name: 'Shipping Notification',
      slug: 'shipping-notification',
      description: 'Sent when an order is marked as shipped',
    },
    {
      name: 'Abandoned Cart',
      slug: 'abandoned-cart',
      description: 'First email in abandoned cart sequence (1 hour)',
    },
    {
      name: 'Welcome Email',
      slug: 'welcome',
      description: 'Sent to new customers after first purchase',
    },
    {
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Marketing email featuring new products',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Email Template Preview
          </h1>
          <p className="text-gray-600 mb-8">
            Preview and test email templates during development. Click on a template
            to view it rendered.
          </p>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Link
                key={template.slug}
                href={`/email-preview/${template.slug}`}
                className="block p-6 border border-gray-200 rounded-lg hover:border-amber-700 hover:shadow-md transition-all"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {template.name}
                </h2>
                <p className="text-gray-600 text-sm">{template.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-2">
              Development Only
            </h3>
            <p className="text-sm text-amber-800">
              This page is for development and testing purposes. In production,
              remove this route or add authentication to prevent public access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
