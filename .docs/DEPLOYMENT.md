# Deployment Guide - Vercel

This guide walks you through deploying the Vintage Store to Vercel (recommended hosting platform for Next.js applications).

## Prerequisites

Before deploying, ensure you have:

- [x] Completed Firebase setup (see README.md)
- [x] Set up Stripe account with API keys
- [x] Pushed your code to a Git repository (GitHub, GitLab, or Bitbucket)
- [x] A Vercel account (sign up at https://vercel.com)

## Step 1: Prepare for Production

### 1.1 Verify Production Build

Test that your application builds successfully:

```bash
npm run build
```

If you encounter errors, fix them before proceeding.

### 1.2 Run Type Checking

```bash
npm run type-check
```

Fix any TypeScript errors.

### 1.3 Run Linting

```bash
npm run lint
```

Address any linting warnings or errors.

## Step 2: Firebase Production Setup

### 2.1 Update Firestore Security Rules

Ensure your Firestore security rules are production-ready:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    // Products - read public, write admin only
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders - SECURE: Server-side creation only
    // Orders are created by API routes using Admin SDK (bypasses these rules)
    // Users access orders via unique order ID after Stripe payment
    match /orders/{orderId} {
      // Only admins can read all orders
      allow read: if isAdmin();

      // Client-side creation disabled - orders created server-side via Admin SDK
      // This prevents price manipulation and fraudulent orders
      allow create: if false;

      // Only admins can update order status
      allow update: if isAdmin();

      // No deletes allowed
      allow delete: if false;
    }

    // Customers - users can read/write their own data
    match /customers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admins - admin only read
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Manually managed in console
    }
  }
}
```

### 2.2 Create Firestore Indexes

Ensure all required indexes are created:

1. Go to Firebase Console > Firestore Database > Indexes
2. Create composite indexes for:
   - `products`: `inStock` (Ascending), `createdAt` (Descending)
   - `products`: `era` (Ascending), `createdAt` (Descending)
   - `products`: `category` (Ascending), `createdAt` (Descending)
   - `orders`: `status` (Ascending), `createdAt` (Descending)

### 2.3 Seed Production Database

If your production database is empty, seed it with products:

```bash
# Temporarily set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false in .env.local
npm run seed
```

## Step 3: Stripe Production Setup

### 3.1 Switch to Live API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle "Test mode" to OFF (top right)
3. Navigate to **Developers > API keys**
4. Copy your **Live** Publishable key and Secret key
5. **Important**: Keep these keys secure - never commit them to Git

### 3.2 Set Up Production Webhook

You'll configure this after deploying to Vercel (Step 5.3).

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Sign in with GitHub/GitLab/Bitbucket

2. **Import Repository**
   - Click "Add New..." > "Project"
   - Select your Git provider
   - Choose the `vintage-store` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Click "Deploy"** (we'll add environment variables after first deploy)

5. **Wait for Deployment**
   - First deployment will fail due to missing environment variables
   - This is expected - we'll fix it in the next step

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy: Yes
   - Which scope: Select your account
   - Link to existing project: No
   - Project name: vintage-store (or your preference)
   - Directory: `./`
   - Override settings: No

## Step 5: Configure Environment Variables

### 5.1 Add Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:

#### Firebase Variables

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API key | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Your measurement ID (optional) | Production, Preview, Development |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` | `false` | Production, Preview |

#### Stripe Variables

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_live_... (LIVE key) | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_test_... (TEST key) | Preview, Development |
| `STRIPE_SECRET_KEY` | sk_live_... (LIVE key) | Production |
| `STRIPE_SECRET_KEY` | sk_test_... (TEST key) | Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | whsec_... (from Step 5.3) | Production |

**Important Notes:**
- For "Environment", select all three (Production, Preview, Development) for Firebase variables
- For Stripe, use LIVE keys for Production and TEST keys for Preview/Development
- Webhook secret will be added after creating the webhook endpoint

### 5.2 Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**
4. Select "Use existing Build Cache: No"
5. Click **Redeploy**

### 5.3 Set Up Stripe Production Webhook

1. **Get Your Vercel URL**
   - After successful deployment, copy your production URL
   - Example: `https://vintage-store.vercel.app`

2. **Create Webhook in Stripe**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Ensure "Test mode" is OFF
   - Navigate to **Developers > Webhooks**
   - Click **Add endpoint**

3. **Configure Webhook**
   - Endpoint URL: `https://your-domain.vercel.app/api/webhook`
   - Description: "Vintage Store Production Webhook"
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
   - Click **Add endpoint**

4. **Get Webhook Secret**
   - Click on your newly created webhook
   - Click **Reveal** next to "Signing secret"
   - Copy the secret (starts with `whsec_`)

5. **Add to Vercel**
   - Go back to Vercel Dashboard
   - Settings > Environment Variables
   - Add new variable:
     - Name: `STRIPE_WEBHOOK_SECRET`
     - Value: whsec_... (the secret you just copied)
     - Environment: Production
   - Click **Save**

6. **Redeploy Again**
   - Go to Deployments tab
   - Redeploy with the new webhook secret

## Step 6: Verify Deployment

### 6.1 Test the Site

1. Visit your production URL
2. Test the following:
   - [ ] Homepage loads correctly
   - [ ] Shop page displays products
   - [ ] Product detail pages work
   - [ ] Add items to cart
   - [ ] Cart page shows correct items
   - [ ] Checkout flow works
   - [ ] Test payment with live Stripe card (or test card if using test mode)

### 6.2 Test a Live Payment (Optional - Small Amount)

If you want to test with a live payment:

1. Make a small purchase (€1-5)
2. Use a real card or Stripe test cards
3. Verify order appears in admin panel
4. Check Stripe Dashboard for the payment
5. Verify webhook is being triggered (Stripe Dashboard > Developers > Webhooks > Recent events)

**Stripe Test Cards (if still in test mode):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### 6.3 Test Admin Panel

1. Navigate to `/admin/orders`
2. Verify orders are displayed
3. Try updating an order status
4. Ensure Firebase authentication works for admin access

### 6.4 Monitor Errors

1. In Vercel Dashboard, go to your project
2. Click on **Logs** or **Monitoring**
3. Check for any runtime errors
4. Verify no errors in browser console

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. In Vercel Dashboard, go to **Settings > Domains**
2. Click **Add**
3. Enter your domain (e.g., `mystore.com`)
4. Click **Add**

### 7.2 Configure DNS

Follow Vercel's instructions to configure your DNS:
- **A Record**: Point to Vercel's IP
- **CNAME Record**: Point to `cname.vercel-dns.com`

### 7.3 Update Stripe Webhook

If using a custom domain:
1. Go to Stripe Dashboard > Webhooks
2. Edit your production webhook
3. Update URL to: `https://yourdomain.com/api/webhook`
4. Save changes

### 7.4 Update Firebase Authorized Domains

1. Go to Firebase Console
2. Navigate to **Authentication > Settings > Authorized domains**
3. Add your custom domain
4. Click **Add**

## Step 8: Post-Deployment

### 8.1 Set Up Monitoring

Consider setting up:
- **Vercel Analytics**: Monitor performance
- **Sentry**: Error tracking
- **Google Analytics**: Track user behavior
- **Stripe Radar**: Fraud prevention

### 8.2 Enable Vercel Protection (Optional)

1. Go to **Settings > Deployment Protection**
2. Enable options like:
   - Password protection for preview deployments
   - Vercel Authentication

### 8.3 Set Up Automatic Deployments

Vercel automatically deploys on git push:
- **Production**: Deployments from `main` branch
- **Preview**: Deployments from feature branches

## Troubleshooting

### Build Fails

```bash
# Check build logs in Vercel Dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors
# - Import errors

# Fix locally first:
npm run build
npm run type-check
```

### Stripe Webhook Not Working

1. Verify webhook secret is correct in Vercel
2. Check Stripe Dashboard > Webhooks > Recent events for errors
3. Ensure endpoint URL matches your deployment URL
4. Verify webhook signature verification in code

### Firebase Connection Issues

1. Verify all Firebase environment variables are set
2. Check Firebase security rules allow the operations
3. Verify Firebase project is active
4. Check browser console for specific Firebase errors

### Orders Not Saving

1. Check Firestore security rules
2. Verify API routes are working (check Vercel logs)
3. Test webhook delivery in Stripe Dashboard
4. Check browser network tab for failed API calls

## Continuous Deployment

Once set up, your deployment workflow is:

1. Make changes locally
2. Test thoroughly: `npm run build && npm run type-check`
3. Commit changes: `git commit -m "description"`
4. Push to git: `git push origin main`
5. Vercel automatically deploys
6. Monitor deployment in Vercel Dashboard

## Rollback

If a deployment breaks production:

1. Go to Vercel Dashboard > Deployments
2. Find the last working deployment
3. Click three dots (...) > "Promote to Production"
4. The site will instantly rollback

## Security Checklist

Before going live, ensure:

- [ ] All API keys are in environment variables (not in code)
- [ ] Stripe live keys are only in Production environment
- [ ] Firebase security rules are properly configured
- [ ] Webhook signatures are verified
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] No sensitive data in client-side code
- [ ] Test mode is OFF in Stripe for production
- [ ] Admin authentication is working
- [ ] `.env.local` is in `.gitignore`

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Firebase Support**: https://firebase.google.com/support
- **Stripe Support**: https://support.stripe.com

## Summary

Your deployment is complete! 🎉

- **Production URL**: https://your-project.vercel.app
- **Firebase Project**: Check Firebase Console
- **Stripe Dashboard**: Monitor payments
- **Vercel Dashboard**: Monitor deployments and performance

Next steps:
1. Share your store URL
2. Process your first order
3. Monitor analytics
4. Continue improving features
