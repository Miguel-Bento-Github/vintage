# Email Templates

This directory contains all email templates for Dream Azul, built with React Email and Resend.

## Directory Structure

```
emails/
├── components/          # Reusable email components
│   ├── EmailLayout.tsx  # Base layout wrapper
│   ├── Header.tsx       # Email header with logo
│   ├── Footer.tsx       # Email footer with links
│   ├── Button.tsx       # CTA button component
│   └── ProductCard.tsx  # Product display card
└── templates/           # Email templates
    └── TestEmail.tsx    # Test email template
```

## Components

### EmailLayout
Base layout wrapper that provides consistent structure for all emails.

```tsx
import EmailLayout from '@/emails/components/EmailLayout';

<EmailLayout preview="Email preview text" unsubscribeUrl="...">
  {/* Email content */}
</EmailLayout>
```

### Button
CTA button that works across all email clients (including Outlook).

```tsx
import Button from '@/emails/components/Button';

<Button
  href="https://example.com/shop"
  text="Shop Now"
  color="#92400e"
  textColor="#ffffff"
/>
```

### ProductCard
Display product information in emails.

```tsx
import ProductCard from '@/emails/components/ProductCard';

<ProductCard
  imageUrl="https://..."
  title="Vintage Leather Jacket"
  brand="Schott NYC"
  era="1980s"
  price={249.99}
  currency="USD"
  productUrl="https://..."
/>
```

## Creating New Templates

1. Create a new file in `emails/templates/YourTemplate.tsx`
2. Import and use the base layout and components
3. Export your template as the default export
4. Add it to the preview system (optional)

Example:

```tsx
import { Text, Heading } from '@react-email/components';
import EmailLayout from '../components/EmailLayout';
import Button from '../components/Button';

interface YourTemplateProps {
  name: string;
}

export default function YourTemplate({ name }: YourTemplateProps) {
  return (
    <EmailLayout preview="Welcome to Dream Azul">
      <Heading>Hello, {name}!</Heading>
      <Text>Welcome to our vintage clothing store.</Text>
      <Button href="/shop" text="Start Shopping" />
    </EmailLayout>
  );
}
```

## Testing Templates

### Preview in Browser

1. Navigate to `/en/email-preview` (or your locale)
2. Click on the template you want to preview
3. View the rendered email

### Send Test Email

1. Go to `/en/email-preview/test`
2. Click "Send Test Email"
3. Enter your email address
4. Click "Send"

**Note:** With `onboarding@resend.dev`, test emails can only be sent to your Resend account email.

### API Route

Send a test email programmatically:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com", "name": "John Doe"}'
```

## Rendering Templates in Code

To render and send an email template:

```tsx
import { render } from '@react-email/components';
import { sendEmail } from '@/lib/email/helpers';
import YourTemplate from '@/emails/templates/YourTemplate';
import { EmailType } from '@/lib/email/config';

// Render the template
const emailHtml = await render(
  YourTemplate({ name: 'John Doe' })
);

// Send the email
const result = await sendEmail(
  'customer@example.com',
  'Email Subject',
  emailHtml,
  undefined, // Optional plain text version
  EmailType.PROMOTIONAL
);
```

## Best Practices

### Email Client Compatibility

- Use tables for layout (required for Outlook)
- Use inline styles only (no CSS classes)
- Keep max width at 600px
- Always provide alt text for images
- Test in multiple email clients

### Styling

- Use web-safe fonts: Arial, Helvetica, Georgia
- Keep color palette consistent with brand
- Ensure sufficient color contrast for accessibility
- Support dark mode where possible

### Content

- Keep subject lines under 50 characters
- Include preview text for better open rates
- Make CTAs clear and prominent
- Always include unsubscribe link for marketing emails
- Provide plain text version for accessibility

### Performance

- Optimize images (compress, use CDN)
- Keep total email size under 102KB (Gmail clipping limit)
- Use lazy loading for below-fold images
- Minimize use of custom fonts

## Configuration

Email configuration is centralized in `/lib/email/config.ts`:

- From addresses
- Footer content
- Social media links
- Template defaults
- Email types for analytics

## Production Checklist

Before going to production:

- [ ] Verify custom domain in Resend dashboard
- [ ] Update `RESEND_FROM_EMAIL` to custom domain
- [ ] Add DNS records (SPF, DKIM, DMARC)
- [ ] Test all templates in major email clients
- [ ] Set up unsubscribe system
- [ ] Configure email analytics
- [ ] Remove or protect `/email-preview` route
- [ ] Set up monitoring for email deliverability

## Resources

- [React Email Documentation](https://react.email/docs)
- [Resend Documentation](https://resend.com/docs)
- [Email Design Best Practices](https://www.campaignmonitor.com/resources/guides/email-design/)
- [Can I Email](https://www.caniemail.com/) - Email client compatibility reference
