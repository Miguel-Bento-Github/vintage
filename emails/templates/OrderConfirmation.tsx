import { Text, Heading, Section, Hr } from '@react-email/components';
import EmailLayout from '../components/EmailLayout';
import Button from '../components/Button';
import { Order } from '@/types';
import { getEmailMessages } from '@/lib/email/translations';
import type { Locale } from '@/i18n';

interface OrderConfirmationProps {
  order: Order;
  locale?: string;
}

/**
 * Order Confirmation Email
 * Sent immediately after successful payment
 */
export default function OrderConfirmation({
  order,
  locale = 'en',
}: OrderConfirmationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vintage-store-mu.vercel.app';

  // Get translations
  const t = getEmailMessages(locale as Locale, 'orderConfirmation');

  // Format currency
  const formatPrice = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (timestamp: { toDate: () => Date } | Date) => {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <EmailLayout preview={t.preview.replace('{orderNumber}', order.orderNumber)}>
      {/* Success Message */}
      <Heading style={styles.heading}>
        {t.heading} 🎉
      </Heading>

      <Text style={styles.paragraph}>
        {t.greeting.replace('{name}', order.customerInfo.name)}
      </Text>

      <Text style={styles.paragraph}>
        {t.intro}
      </Text>

      {/* Order Number - Prominent */}
      <Section style={styles.orderNumberSection}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
      </Section>

      <Text style={styles.paragraph}>
        <strong>{t.orderDate}:</strong> {formatDate(order.createdAt)}
      </Text>

      <Hr style={styles.hr} />

      {/* Order Items */}
      <Heading as="h2" style={styles.subheading}>
        {t.yourItems}
      </Heading>

      {order.items.map((item, index) => (
        <Section key={index} style={styles.itemRow}>
          <table width="100%" cellPadding="0" cellSpacing="0">
            <tr>
              <td width="70%" style={styles.itemDetails}>
                <Text style={styles.itemTitle}>
                  {item.brand} - {item.title}
                </Text>
                <Text style={styles.itemMeta}>
                  {t.era}: {item.era} • {t.size}: {item.size}
                </Text>
              </td>
              <td width="30%" align="right">
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              </td>
            </tr>
          </table>
          {index < order.items.length - 1 && <Hr style={styles.itemDivider} />}
        </Section>
      ))}

      <Hr style={styles.hr} />

      {/* Order Summary */}
      <Section style={styles.summary}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tr>
            <td>
              <Text style={styles.summaryLabel}>{t.subtotal}:</Text>
            </td>
            <td align="right">
              <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text style={styles.summaryLabel}>{t.shipping}:</Text>
            </td>
            <td align="right">
              <Text style={styles.summaryValue}>
                {order.shipping === 0 ? t.free : formatPrice(order.shipping)}
              </Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text style={styles.summaryLabel}>{t.tax}:</Text>
            </td>
            <td align="right">
              <Text style={styles.summaryValue}>{formatPrice(order.tax)}</Text>
            </td>
          </tr>
          <tr style={{ borderTop: '2px solid #e5e5e5' }}>
            <td>
              <Text style={styles.totalLabel}>{t.total}:</Text>
            </td>
            <td align="right">
              <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
            </td>
          </tr>
        </table>
      </Section>

      <Hr style={styles.hr} />

      {/* Shipping Address */}
      <Heading as="h2" style={styles.subheading}>
        {t.shippingAddress}
      </Heading>
      <Text style={styles.address}>
        {order.customerInfo.name}<br />
        {order.customerInfo.shippingAddress.street}<br />
        {order.customerInfo.shippingAddress.city}, {order.customerInfo.shippingAddress.state} {order.customerInfo.shippingAddress.postalCode}<br />
        {order.customerInfo.shippingAddress.country}
      </Text>

      <Hr style={styles.hr} />

      {/* What Happens Next */}
      <Heading as="h2" style={styles.subheading}>
        {t.whatHappensNext}
      </Heading>
      <Text style={styles.paragraph}>
        1. <strong>{t.step1Title}</strong> {t.step1Text}
      </Text>
      <Text style={styles.paragraph}>
        2. <strong>{t.step2Title}</strong> {t.step2Text}
      </Text>
      <Text style={styles.paragraph}>
        3. <strong>{t.step3Title}</strong> {t.step3Text}
      </Text>

      {/* View Order Button */}
      <Button
        href={`${baseUrl}/${locale}/account/orders`}
        text={t.viewOrderButton}
      />

      <Hr style={styles.hr} />

      {/* Support */}
      <Text style={styles.supportText}>
        {t.supportText}<br />
        {t.supportEmail} <a href="mailto:support@dreamazul.com" style={styles.link}>support@dreamazul.com</a>
      </Text>

      <Text style={styles.thankYou}>
        {t.thankYou} ✨
      </Text>
    </EmailLayout>
  );
}

const styles = {
  heading: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    fontFamily: 'Georgia, serif',
  },
  subheading: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1a1a1a',
    margin: '24px 0 16px',
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#374151',
    margin: '0 0 16px',
  },
  orderNumberSection: {
    backgroundColor: '#f5f2ed',
    border: '2px solid #d4c5b0',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  orderNumber: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#92400e',
    margin: 0,
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  hr: {
    borderColor: '#e5e5e5',
    margin: '24px 0',
  },
  itemRow: {
    marginBottom: '16px',
  },
  itemDetails: {
    paddingRight: '16px',
  },
  itemTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a1a1a',
    margin: '0 0 4px',
  },
  itemMeta: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  itemPrice: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a1a1a',
    margin: 0,
  },
  itemDivider: {
    borderColor: '#f3f4f6',
    margin: '12px 0',
  },
  summary: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0',
  },
  summaryLabel: {
    fontSize: '15px',
    color: '#4b5563',
    margin: '8px 0',
  },
  summaryValue: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#1a1a1a',
    margin: '8px 0',
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: '12px 0 8px',
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#92400e',
    margin: '12px 0 8px',
  },
  address: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#4b5563',
    margin: '0 0 16px',
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
  },
  supportText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '16px 0',
  },
  link: {
    color: '#92400e',
    textDecoration: 'none',
  },
  thankYou: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#92400e',
    textAlign: 'center' as const,
    margin: '24px 0 0',
  },
};
