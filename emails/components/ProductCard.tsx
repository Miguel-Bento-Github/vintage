import { Section, Img, Text, Link } from '@react-email/components';
import { EMAIL_CONFIG } from '@/lib/email/config';

interface ProductCardProps {
  imageUrl: string;
  title: string;
  brand?: string;
  era?: string;
  price: number;
  currency: string;
  productUrl: string;
}

/**
 * Product display card for emails
 * Shows product image, details, and price
 */
export default function ProductCard({
  imageUrl,
  title,
  brand,
  era,
  price,
  currency,
  productUrl,
}: ProductCardProps) {
  // Format price with currency symbol
  const formatPrice = (amount: number, curr: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
    };
    const symbol = symbols[curr] || curr;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <Link href={productUrl} style={styles.link}>
      <Section style={styles.card}>
        {/* Product Image */}
        <Img
          src={imageUrl}
          alt={`${brand || ''} ${title}`.trim()}
          width="100%"
          style={styles.image}
        />

        {/* Product Details */}
        <Section style={styles.details}>
          {era && <Text style={styles.era}>{era}</Text>}

          <Text style={styles.title}>{title}</Text>

          {brand && <Text style={styles.brand}>{brand}</Text>}

          <Text style={styles.price}>{formatPrice(price, currency)}</Text>
        </Section>
      </Section>
    </Link>
  );
}

const styles = {
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '16px',
    transition: 'box-shadow 0.2s',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'cover' as const,
  },
  details: {
    padding: '16px',
  },
  era: {
    fontSize: '12px',
    color: EMAIL_CONFIG.templates.accentColor,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    margin: '0 0 8px',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: EMAIL_CONFIG.templates.textColor,
    margin: '0 0 4px',
    lineHeight: '1.4',
  },
  brand: {
    fontSize: '14px',
    color: '#666666',
    margin: '0 0 12px',
  },
  price: {
    fontSize: '18px',
    fontWeight: 700,
    color: EMAIL_CONFIG.templates.textColor,
    margin: '0',
  },
};
