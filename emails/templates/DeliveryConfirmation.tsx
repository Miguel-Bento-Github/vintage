import { Text, Heading, Section, Hr } from '@react-email/components';
import EmailLayout from '../components/EmailLayout';
import Button from '../components/Button';
import { Order } from '@/types';
import { getEmailMessages } from '@/lib/email/translations';
import type { Locale } from '@/i18n';

interface DeliveryConfirmationProps {
  order: Order;
  locale?: Locale;
}

/**
 * Delivery Confirmation Email
 * Sent when order status changes to 'delivered'
 */
export default function DeliveryConfirmation({
  order,
  locale = 'en',
}: DeliveryConfirmationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vintage-store-mu.vercel.app';

  // Get translations
  const t = getEmailMessages(locale, 'deliveryConfirmation');

  // Format currency
  const formatPrice = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  return (
    <EmailLayout preview={t.preview.replace('{orderNumber}', order.orderNumber)}>
      {/* Success Message */}
      <Heading style={styles.heading}>
        {t.heading} ✨
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

      <Hr style={styles.hr} />

      {/* Delivered Items */}
      <Heading as="h2" style={styles.subheading}>
        {t.deliveredItems}
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

      {/* Delivery Address */}
      <Heading as="h2" style={styles.subheading}>
        {t.deliveredTo}
      </Heading>
      <Text style={styles.address}>
        {order.customerInfo.name}<br />
        {order.customerInfo.shippingAddress.street}<br />
        {order.customerInfo.shippingAddress.city}, {order.customerInfo.shippingAddress.state} {order.customerInfo.shippingAddress.postalCode}<br />
        {order.customerInfo.shippingAddress.country}
      </Text>

      <Hr style={styles.hr} />

      {/* Feedback Request */}
      <Heading as="h2" style={styles.subheading}>
        {t.feedbackHeading}
      </Heading>
      <Text style={styles.paragraph}>
        {t.feedbackText}
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
        {t.thankYou} 💫
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
    backgroundColor: '#f5f2ed',
    padding: '20px',
    borderRadius: '8px',
    margin: '16px 0',
    border: '2px solid #d4c5b0',
    textAlign: 'center' as const,
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 8px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#92400e',
    margin: 0,
    fontFamily: 'monospace',
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
