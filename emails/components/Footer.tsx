import { Section, Text, Link, Hr } from '@react-email/components';
import { EMAIL_CONFIG } from '@/lib/email/config';

interface FooterProps {
  unsubscribeUrl?: string;
  includeUnsubscribe?: boolean;
}

/**
 * Email footer component
 * Contains social links, legal links, and company info
 */
export default function Footer({
  unsubscribeUrl,
  includeUnsubscribe = false,
}: FooterProps) {
  const { footer } = EMAIL_CONFIG;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <Section style={styles.footer}>
      <Hr style={styles.hr} />

      {/* Social Media Links */}
      <Section style={styles.socialSection}>
        <Link href={footer.socialMedia.instagram} style={styles.socialLink}>
          Instagram
        </Link>
        {' • '}
        <Link href={footer.socialMedia.facebook} style={styles.socialLink}>
          Facebook
        </Link>
        {' • '}
        <Link href={footer.socialMedia.twitter} style={styles.socialLink}>
          Twitter
        </Link>
      </Section>

      {/* Footer Links */}
      <Section style={styles.footerLinks}>
        <Link href={`${baseUrl}${footer.links.about}`} style={styles.footerLink}>
          About
        </Link>
        {' • '}
        <Link href={`${baseUrl}${footer.links.contact}`} style={styles.footerLink}>
          Contact
        </Link>
        {' • '}
        <Link href={`${baseUrl}${footer.links.shipping}`} style={styles.footerLink}>
          Shipping
        </Link>
        {' • '}
        <Link href={`${baseUrl}${footer.links.returns}`} style={styles.footerLink}>
          Returns
        </Link>
      </Section>

      {/* Company Info */}
      <Text style={styles.footerText}>
        © {new Date().getFullYear()} {footer.companyName}. All rights reserved.
      </Text>

      {/* Legal Links */}
      <Section style={styles.legalLinks}>
        <Link href={`${baseUrl}${footer.links.privacy}`} style={styles.footerLink}>
          Privacy Policy
        </Link>
        {' • '}
        <Link href={`${baseUrl}${footer.links.terms}`} style={styles.footerLink}>
          Terms of Service
        </Link>
      </Section>

      {/* Unsubscribe Link */}
      {includeUnsubscribe && unsubscribeUrl && (
        <Text style={styles.unsubscribeText}>
          <Link href={unsubscribeUrl} style={styles.unsubscribeLink}>
            Unsubscribe from marketing emails
          </Link>
        </Text>
      )}
    </Section>
  );
}

const styles = {
  footer: {
    backgroundColor: '#f5f5f5',
    padding: '24px',
  },
  hr: {
    borderColor: '#e5e5e5',
    margin: '0 0 20px',
  },
  socialSection: {
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  socialLink: {
    color: EMAIL_CONFIG.templates.accentColor,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  footerLinks: {
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  footerLink: {
    color: '#666666',
    textDecoration: 'none',
    fontSize: '12px',
  },
  footerText: {
    color: '#666666',
    fontSize: '12px',
    textAlign: 'center' as const,
    margin: '8px 0',
  },
  legalLinks: {
    textAlign: 'center' as const,
    marginTop: '12px',
  },
  unsubscribeText: {
    color: '#999999',
    fontSize: '11px',
    textAlign: 'center' as const,
    marginTop: '16px',
  },
  unsubscribeLink: {
    color: '#999999',
    textDecoration: 'underline',
  },
};
