import { Text, Heading, Section, Hr } from '@react-email/components';
import EmailLayout from '../components/EmailLayout';
import Button from '../components/Button';
import { Order, FirebaseTimestamp } from '@/types';

interface AdminOrderNotificationProps {
  order: Order;
}

/**
 * Admin Order Notification Email
 * Sent to admin when a new order is placed
 */
export default function AdminOrderNotification({
  order,
}: AdminOrderNotificationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vintage-store-mu.vercel.app';

  // Format currency
  const formatPrice = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (timestamp: FirebaseTimestamp) => {
    let date: Date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      date = new Date();
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <EmailLayout preview={`New Order: ${order.orderNumber} - ${formatPrice(order.total)}`}>
      {/* Alert Message */}
      <Heading style={styles.heading}>
        New Order Received! 🛍️
      </Heading>

      <Text style={styles.paragraph}>
        A new order has been placed on Dream Azul.
      </Text>

      {/* Order Number - Prominent */}
      <Section style={styles.orderNumberSection}>
        <Text style={styles.orderLabel}>Order Number</Text>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
      </Section>

      {/* Quick Stats */}
      <Section style={styles.statsSection}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tr>
            <td width="50%" style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{formatPrice(order.total)}</Text>
            </td>
            <td width="50%" style={styles.statItem}>
              <Text style={styles.statLabel}>Items</Text>
              <Text style={styles.statValue}>{order.items.length}</Text>
            </td>
          </tr>
        </table>
      </Section>

      <Text style={styles.paragraph}>
        <strong>Order Date:</strong> {formatDate(order.createdAt)}
      </Text>

      <Hr style={styles.hr} />

      {/* Customer Information */}
      <Heading as="h2" style={styles.subheading}>
        Customer Information
      </Heading>

      <Section style={styles.infoSection}>
        <Text style={styles.infoItem}>
          <strong>Name:</strong> {order.customerInfo.name}
        </Text>
        <Text style={styles.infoItem}>
          <strong>Email:</strong> {order.customerInfo.email}
        </Text>
      </Section>

      <Hr style={styles.hr} />

      {/* Shipping Address */}
      <Heading as="h2" style={styles.subheading}>
        Shipping Address
      </Heading>

      <Section style={styles.infoSection}>
        <Text style={styles.infoItem}>
          {order.customerInfo.shippingAddress.street}
        </Text>
        <Text style={styles.infoItem}>
          {order.customerInfo.shippingAddress.city}, {order.customerInfo.shippingAddress.state} {order.customerInfo.shippingAddress.postalCode}
        </Text>
        <Text style={styles.infoItem}>
          {order.customerInfo.shippingAddress.country}
        </Text>
      </Section>

      <Hr style={styles.hr} />

      {/* Order Items */}
      <Heading as="h2" style={styles.subheading}>
        Order Items
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
                  Era: {item.era} • Size: {item.size}
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
      <Section style={styles.summarySection}>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tr>
            <td>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
            </td>
            <td align="right">
              <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text style={styles.summaryLabel}>Shipping:</Text>
            </td>
            <td align="right">
              <Text style={styles.summaryValue}>{formatPrice(order.shipping)}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text style={styles.summaryLabel}>Tax:</Text>
            </td>
            <td align="right">
              <Text style={styles.summaryValue}>{formatPrice(order.tax)}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <Text style={styles.totalLabel}>Total:</Text>
            </td>
            <td align="right">
              <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
            </td>
          </tr>
        </table>
      </Section>

      {/* CTA Button */}
      <Section style={styles.buttonSection}>
        <Button
          href={`${baseUrl}/admin/orders`}
          text="View in Admin Panel"
        />
      </Section>

      <Text style={styles.footerNote}>
        This order has been automatically recorded in your admin panel. You can update the order status and add tracking information there.
      </Text>
    </EmailLayout>
  );
}

const styles = {
  heading: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  orderNumberSection: {
    backgroundColor: '#f8f5f0',
    padding: '24px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  orderLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  orderNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#92400e',
    margin: '0',
  },
  statsSection: {
    backgroundColor: '#f0fdf4',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  statItem: {
    textAlign: 'center' as const,
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#15803d',
    margin: '0',
  },
  hr: {
    borderColor: '#e5e7eb',
    margin: '24px 0',
  },
  subheading: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  infoSection: {
    marginBottom: '16px',
  },
  infoItem: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  itemRow: {
    marginBottom: '16px',
  },
  itemDetails: {
    paddingRight: '16px',
  },
  itemTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  itemMeta: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
  },
  itemPrice: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0',
  },
  itemDivider: {
    borderColor: '#f3f4f6',
    margin: '12px 0',
  },
  summarySection: {
    marginBottom: '24px',
  },
  summaryLabel: {
    fontSize: '15px',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  summaryValue: {
    fontSize: '15px',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: '8px',
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: '8px',
  },
  buttonSection: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  footerNote: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center' as const,
    marginTop: '24px',
  },
};
