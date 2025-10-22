import { Text, Heading, Section, Hr } from '@react-email/components';
import EmailLayout from '../components/EmailLayout';
import Button from '../components/Button';
import { Order } from '@/types';
import { getEmailMessages } from '@/lib/email/translations';
import type { Locale } from '@/i18n';

interface CancellationEmailProps {
  order: Order;
  cancellationReason?: string;
  locale?: Locale;
}

/**
 * Cancellation Email
 * Sent when order status changes to 'cancelled'
 */
export default function CancellationEmail({
  order,
  cancellationReason,
  locale = 'en',
}: CancellationEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vintage-store-mu.vercel.app';

  // Get translations
  const t = getEmailMessages(locale, 'cancellationEmail');

  // Format currency
  const formatPrice = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  return (
    <EmailLayout preview={t.preview.replace('{orderNumber}', order.orderNumber)}>
      {/* Cancellation Message */}
      <Heading style={styles.heading}>
        {t.heading}
      </Heading>

      <Text style={styles.paragraph}>
        {t.greeting.replace('{name}', order.customerInfo.name)}
      </Text>

      <Text style={styles.paragraph}>
        {t.intro}
      </Text>

      {/* Order Number */}
      <Section style={styles.infoSection}>
        <Text style={styles.infoLabel}>{t.orderNumber}:</Text>
        <Text style={styles.infoValue}>{order.orderNumber}</Text>
      </Section>

      {/* Cancellation Reason */}
      {cancellationReason && (
        <Section style={styles.reasonSection}>
          <Text style={styles.reasonLabel}>{t.reasonLabel}:</Text>
          <Text style={styles.reasonText}>{cancellationReason}</Text>
        </Section>
      )}

      <Hr style={styles.hr} />

      {/* Cancelled Items */}
      <Heading as="h2" style={styles.subheading}>
        {t.cancelledItems}
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

      {/* Refund Information */}
      <Section style={styles.refundSection}>
        <Heading as="h2" style={styles.subheading}>
          {t.refundHeading}
        </Heading>
        <Text style={styles.paragraph}>
          {t.refundText}
        </Text>
        <Text style={styles.refundAmount}>
          {t.refundAmount}: <strong>{formatPrice(order.total)}</strong>
        </Text>
        <Text style={styles.refundNote}>
          {t.refundNote}
        </Text>
      </Section>

      <Hr style={styles.hr} />

      {/* Continue Shopping */}
      <Text style={styles.paragraph}>
        {t.continueShoppingText}
      </Text>

      <Button
        href={`${baseUrl}/${locale}`}
        text={t.continueShoppingButton}
      />

      <Hr style={styles.hr} />

      {/* Support */}
      <Text style={styles.supportText}>
        {t.supportText}<br />
        {t.supportEmail} <a href="mailto:support@dreamazul.com" style={styles.link}>support@dreamazul.com</a>
      </Text>

      <Text style={styles.apology}>
        {t.apology}
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
  infoSection: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0',
    textAlign: 'center' as const,
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 4px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
    fontFamily: 'monospace',
  },
  reasonSection: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
  },
  reasonLabel: {
    fontSize: '14px',
    color: '#92400e',
    margin: '0 0 8px',
    fontWeight: 600,
  },
  reasonText: {
    fontSize: '15px',
    color: '#78350f',
    margin: 0,
    fontStyle: 'italic' as const,
  },
  refundSection: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '8px',
    padding: '20px',
    margin: '16px 0',
  },
  refundAmount: {
    fontSize: '18px',
    color: '#166534',
    margin: '16px 0',
    textAlign: 'center' as const,
  },
  refundNote: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0 0',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
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
  apology: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '24px 0 0',
    fontStyle: 'italic' as const,
  },
};
