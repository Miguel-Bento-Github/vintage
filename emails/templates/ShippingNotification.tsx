import { Text, Heading, Section, Hr } from '@react-email/components';
import EmailLayout from '../components/EmailLayout';
import Button from '../components/Button';
import { Order } from '@/types';
import { getEmailMessages } from '@/lib/email/translations';
import type { Locale } from '@/i18n';

interface ShippingNotificationProps {
  order: Order;
  trackingUrl?: string;
  carrier?: string;
  estimatedDelivery?: string;
  locale?: string;
}

/**
 * Shipping Notification Email
 * Sent when order status changes to 'shipped'
 */
export default function ShippingNotification({
  order,
  trackingUrl,
  carrier = 'USPS',
  estimatedDelivery = '5-7 business days',
  locale = 'en',
}: ShippingNotificationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vintage-store-mu.vercel.app';

  // Get translations
  const t = getEmailMessages(locale as Locale, 'shippingNotification');

  // Format currency
  const formatPrice = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  return (
    <EmailLayout preview={t.preview.replace('{orderNumber}', order.orderNumber)}>
      {/* Success Message */}
      <Heading style={styles.heading}>
        {t.heading} 📦
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

      {/* Tracking Number - Prominent */}
      {order.trackingNumber && (
        <Section style={styles.trackingSection}>
          <Text style={styles.trackingLabel}>{t.trackingNumber}:</Text>
          <Text style={styles.trackingNumber}>{order.trackingNumber}</Text>
          <Text style={styles.carrier}>{carrier}</Text>
        </Section>
      )}

      {/* Track Package Button */}
      {trackingUrl && order.trackingNumber && (
        <Button
          href={trackingUrl}
          text={t.trackPackageButton}
        />
      )}

      <Text style={styles.estimatedDelivery}>
        <strong>{t.estimatedDelivery}:</strong> {estimatedDelivery || t.estimatedDeliveryTime}
      </Text>

      <Hr style={styles.hr} />

      {/* Shipped Items */}
      <Heading as="h2" style={styles.subheading}>
        {t.itemsInShipment}
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

      {/* Shipping Address */}
      <Heading as="h2" style={styles.subheading}>
        {t.shippingTo}
      </Heading>
      <Text style={styles.address}>
        {order.customerInfo.name}<br />
        {order.customerInfo.shippingAddress.street}<br />
        {order.customerInfo.shippingAddress.city}, {order.customerInfo.shippingAddress.state} {order.customerInfo.shippingAddress.postalCode}<br />
        {order.customerInfo.shippingAddress.country}
      </Text>

      <Hr style={styles.hr} />

      {/* Important Information */}
      <Heading as="h2" style={styles.subheading}>
        {t.deliveryTips}
      </Heading>
      <Text style={styles.paragraph}>
        • {t.tip1}
      </Text>
      <Text style={styles.paragraph}>
        • {t.tip2}
      </Text>
      <Text style={styles.paragraph}>
        • {t.tip3}
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
  infoSection: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0',
  },
  infoLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 4px',
    fontWeight: 600,
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a1a1a',
    margin: 0,
    fontFamily: 'monospace',
  },
  trackingSection: {
    backgroundColor: '#f5f2ed',
    border: '2px solid #d4c5b0',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  trackingLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 8px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  trackingNumber: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#92400e',
    margin: '0 0 8px',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  carrier: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    fontWeight: 500,
  },
  estimatedDelivery: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#374151',
    textAlign: 'center' as const,
    margin: '16px 0',
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
