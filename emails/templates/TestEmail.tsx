import { Text, Heading, Section } from '@react-email/components';
import EmailLayout from '../components/EmailLayout';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';

interface TestEmailProps {
  customerName?: string;
}

/**
 * Test Email Template
 * Used to verify email system is working correctly
 */
export default function TestEmail({ customerName = 'Valued Customer' }: TestEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <EmailLayout preview="This is a test email from Dream Azul">
      <Heading style={styles.heading}>Hello, {customerName}!</Heading>

      <Text style={styles.paragraph}>
        This is a test email to verify that the Dream Azul email system is working
        correctly.
      </Text>

      <Text style={styles.paragraph}>
        If you're seeing this email, it means:
      </Text>

      <Section style={styles.list}>
        <Text style={styles.listItem}>✓ Resend is configured properly</Text>
        <Text style={styles.listItem}>✓ React Email templates are rendering</Text>
        <Text style={styles.listItem}>✓ Email components are working</Text>
        <Text style={styles.listItem}>✓ Styling is being applied correctly</Text>
      </Section>

      <Button
        href={`${baseUrl}/shop`}
        text="Browse Vintage Collection"
      />

      <Section style={styles.divider} />

      <Heading as="h2" style={styles.subheading}>
        Sample Product Card
      </Heading>

      <ProductCard
        imageUrl="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop"
        title="Vintage Leather Jacket"
        brand="Schott NYC"
        era="1980s"
        price={249.99}
        currency="USD"
        productUrl={`${baseUrl}/product/test-jacket`}
      />

      <Text style={styles.paragraph}>
        Thank you for being part of Dream Azul!
      </Text>

      <Text style={styles.signature}>
        — The Dream Azul Team
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
  list: {
    margin: '16px 0',
    padding: '0 0 0 8px',
  },
  listItem: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#4b5563',
    margin: '4px 0',
  },
  divider: {
    margin: '32px 0',
    borderTop: '1px solid #e5e5e5',
  },
  signature: {
    fontSize: '16px',
    fontStyle: 'italic' as const,
    color: '#6b7280',
    margin: '24px 0 0',
  },
};
