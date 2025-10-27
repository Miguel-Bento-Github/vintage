import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import { EMAIL_CONFIG } from '@/lib/email/config';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
  unsubscribeUrl?: string;
}

/**
 * Base email layout wrapper
 * Provides consistent structure, branding, and styling for all emails
 */
export default function EmailLayout({
  children,
  preview,
  unsubscribeUrl,
}: EmailLayoutProps) {
  const { templates, footer } = EMAIL_CONFIG;

  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        {preview && <meta name="description" content={preview} />}
      </Head>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            {/* Logo - Using absolute production URL for email compatibility */}
            <Img
              src="https://www.dreamazul.com/logo.jpg"
              alt={footer.companyName}
              width="80"
              height="80"
              style={styles.logo}
            />
            <Text style={styles.brandName}>{footer.companyName}</Text>
            <Text style={styles.tagline}>Authentic Vintage Items</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>{children}</Section>

          {/* Footer */}
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
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL}${footer.links.about}`}
                style={styles.footerLink}
              >
                About
              </Link>
              {' • '}
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL}${footer.links.contact}`}
                style={styles.footerLink}
              >
                Contact
              </Link>
              {' • '}
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL}${footer.links.shipping}`}
                style={styles.footerLink}
              >
                Shipping
              </Link>
              {' • '}
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL}${footer.links.returns}`}
                style={styles.footerLink}
              >
                Returns
              </Link>
            </Section>

            {/* Company Info */}
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} {footer.companyName}. All rights reserved.
            </Text>

            {/* Legal Links */}
            <Section style={styles.legalLinks}>
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL}${footer.links.privacy}`}
                style={styles.footerLink}
              >
                Privacy Policy
              </Link>
              {' • '}
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL}${footer.links.terms}`}
                style={styles.footerLink}
              >
                Terms of Service
              </Link>
            </Section>

            {/* Unsubscribe Link */}
            {unsubscribeUrl && (
              <Text style={styles.unsubscribeText}>
                <Link href={unsubscribeUrl} style={styles.unsubscribeLink}>
                  Unsubscribe from marketing emails
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: EMAIL_CONFIG.templates.backgroundColor,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: `${EMAIL_CONFIG.templates.maxWidth}px`,
    margin: '0 auto',
    padding: '0',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '32px 24px',
    textAlign: 'center' as const,
    borderBottom: `1px solid ${EMAIL_CONFIG.templates.primaryColor}`,
  },
  logo: {
    margin: '0 auto',
    display: 'block',
  },
  logoEmoji: {
    fontSize: '48px',
    margin: '0 auto',
    textAlign: 'center' as const,
    lineHeight: '1',
  },
  brandName: {
    fontSize: '28px',
    fontWeight: 700,
    color: EMAIL_CONFIG.templates.accentColor,
    margin: '12px 0 0',
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
  content: {
    backgroundColor: '#ffffff',
    padding: '32px 24px',
  },
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
