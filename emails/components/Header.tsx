import { Section, Img, Text } from '@react-email/components';
import { EMAIL_CONFIG } from '@/lib/email/config';

interface HeaderProps {
  logoUrl?: string;
  companyName?: string;
}

/**
 * Email header component
 * Displays logo and company name
 */
export default function Header({
  logoUrl,
  companyName = EMAIL_CONFIG.footer.companyName,
}: HeaderProps) {
  const defaultLogoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://vintage-store-mu.vercel.app'}/logo-512.png`;

  return (
    <Section style={styles.header}>
      {/* Logo - PNG with transparent background */}
      <Img
        src={logoUrl || defaultLogoUrl}
        alt={companyName}
        width="50"
        height="50"
        style={styles.logo}
      />
      <Text style={styles.brandName}>{companyName}</Text>
    </Section>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    padding: '20px 24px',
    textAlign: 'center' as const,
    borderBottom: `1px solid ${EMAIL_CONFIG.templates.primaryColor}`,
  },
  logo: {
    margin: '0 auto 8px',
    display: 'block',
  },
  logoEmoji: {
    fontSize: '48px',
    margin: '0 auto',
    textAlign: 'center' as const,
    lineHeight: '1',
  },
  brandName: {
    fontSize: '22px',
    fontWeight: 700,
    color: EMAIL_CONFIG.templates.accentColor,
    margin: '0',
    fontFamily: 'Georgia, serif',
    textAlign: 'center' as const,
  },
  tagline: {
    fontSize: '13px',
    fontWeight: 400,
    color: '#666666',
    margin: '4px 0 0',
    textAlign: 'center' as const,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
};
