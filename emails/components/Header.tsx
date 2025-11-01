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
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={styles.logoCell}>
            <Img
              src={logoUrl || defaultLogoUrl}
              alt={companyName}
              width="40"
              height="40"
              style={styles.logo}
            />
          </td>
          <td style={styles.brandCell}>
            <Text style={styles.brandName}>{companyName}</Text>
          </td>
        </tr>
      </table>
    </Section>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    padding: '16px 24px',
    borderBottom: `1px solid ${EMAIL_CONFIG.templates.primaryColor}`,
  },
  logoCell: {
    width: '40px',
    verticalAlign: 'middle',
    paddingRight: '12px',
  },
  brandCell: {
    verticalAlign: 'middle',
  },
  logo: {
    display: 'block',
    margin: '0',
  },
  logoEmoji: {
    fontSize: '48px',
    margin: '0 auto',
    textAlign: 'center' as const,
    lineHeight: '1',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: 700,
    color: EMAIL_CONFIG.templates.accentColor,
    margin: '0',
    fontFamily: 'Georgia, serif',
    lineHeight: '40px',
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
