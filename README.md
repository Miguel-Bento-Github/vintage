# Vintage Store - E-Commerce Platform

A modern, full-featured e-commerce platform for vintage clothing built with Next.js 15, Firebase, and Stripe. Features a responsive design, comprehensive error handling, and a complete checkout flow.

## Features

- **Product Catalog**: Browse vintage clothing by era, category, condition, and size
- **Advanced Filtering**: Multi-criteria filtering with price ranges and sorting options
- **Shopping Cart**: Full shopping cart functionality with quantity management
- **Secure Checkout**: Stripe payment processing with customer information collection
- **Order Management**: Admin panel for viewing and managing orders
- **Mobile-First Design**: Fully responsive with WCAG-compliant touch targets (44x44px minimum)
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Loading States**: Skeleton loaders for better perceived performance
- **Firebase Integration**: Firestore for data storage with emulator support for development

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore
- **Payments**: Stripe
- **State Management**: TanStack Query (React Query)
- **UI Components**: Headless UI
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Firebase account (free tier is sufficient to start)
- A Stripe account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd vintage-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` with your Firebase credentials (see Firebase Setup below).

4. **Seed the database** (optional but recommended)
   ```bash
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5577](http://localhost:5577) in your browser.

### Firebase Emulator Setup (Optional for Development)

For local development without using production Firebase:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Start emulators:
   ```bash
   firebase emulators:start
   ```

4. Set in `.env.local`:
   ```env
   NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
   ```

5. Run dev server in a separate terminal:
   ```bash
   npm run dev
   ```

Emulator UI will be available at `http://localhost:3479`

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "vintage-store")
4. Enable/disable Google Analytics as preferred
5. Click "Create project"

### Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Register app name: "Vintage Store Web"
3. **Do NOT check** "Also set up Firebase Hosting" (we'll use Vercel)
4. Click "Register app"
5. You'll see your Firebase configuration object - **keep this page open**

### Step 3: Get Your Firebase Credentials

Copy the values from the Firebase config object and add them to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 4: Enable Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **"Start in test mode"** (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Enable"

### Step 5: Enable Storage

1. Go to **Build > Storage**
2. Click "Get started"
3. Start in **test mode**
4. Use the same location as Firestore
5. Click "Done"

### Step 6: Enable Authentication

1. Go to **Build > Authentication**
2. Click "Get started"
3. Click on "Email/Password" provider
4. **Enable** the first option (Email/Password)
5. Click "Save"

### Step 7: Create Your First Admin User

1. In Authentication, go to the **Users** tab
2. Click "Add user"
3. Enter your email and password
4. Click "Add user"
5. Copy the **User UID** (you'll need this)

### Step 8: Set Up Admin Collection

1. Go to **Firestore Database**
2. Click "Start collection"
3. Collection ID: `admins`
4. Click "Next"
5. Document ID: Paste your **User UID** from Step 7
6. Add field:
   - Field: `email`
   - Type: string
   - Value: your email
7. Click "Save"

### Step 9: Set Up Security Rules

#### Firestore Rules

1. Go to **Firestore Database > Rules**
2. Replace with the following rules:

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

    // Orders - read own orders, write authenticated, admin reads all
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                     (resource.data.customerInfo.email == request.auth.token.email ||
                      isAdmin());
      allow create: if request.auth != null;
      allow update: if isAdmin();
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

3. Click "Publish"

#### Storage Rules

1. Go to **Storage > Rules**
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

3. Click "Publish"

### Step 10: Create Firestore Indexes

These indexes optimize query performance:

1. Go to **Firestore Database > Indexes**
2. Click "Add index"

Create these composite indexes:

**Products Collection:**
- Collection ID: `products`
- Fields to index:
  - `inStock` (Ascending), `createdAt` (Descending)
- Query scope: Collection

Repeat for these field combinations:
- `era` (Ascending), `createdAt` (Descending)
- `category` (Ascending), `createdAt` (Descending)
- `featured` (Ascending), `createdAt` (Descending)

**Orders Collection:**
- Collection ID: `orders`
- Fields to index:
  - `customerInfo.email` (Ascending), `createdAt` (Descending)
  - `status` (Ascending), `createdAt` (Descending)

**Note:** Firebase will also auto-create indexes when you run queries that need them.

## Stripe Setup

### Step 1: Create a Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create an account or sign in
3. Complete account verification

### Step 2: Get API Keys

1. In Stripe Dashboard, go to **Developers > API keys**
2. You'll see two sets of keys:
   - **Test keys** (for development) - starts with `pk_test_` and `sk_test_`
   - **Live keys** (for production) - starts with `pk_live_` and `sk_live_`
3. Copy the **Publishable key** and **Secret key** from the test section

4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```

### Step 3: Set Up Webhook (Production Only)

For production deployment:

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your environment variables in Vercel

### Step 4: Test Webhook Locally (Optional)

To test webhooks during development:

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli#install)
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5577/api/webhook
   ```
4. Copy the webhook signing secret from the CLI output
5. Add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_cli
   ```

### Test Card Numbers

Use these test cards in development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any postal code.

## Project Structure

```
vintage-store/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin panel routes
│   │   └── orders/         # Order management
│   ├── api/                # API routes
│   │   ├── checkout/       # Checkout endpoints
│   │   ├── orders/         # Order endpoints
│   │   └── webhook/        # Stripe webhook handler
│   ├── cart/               # Shopping cart page
│   ├── checkout/           # Checkout flow
│   ├── product/[id]/       # Product detail page
│   ├── shop/               # Product listing page
│   ├── error.tsx           # Global error boundary
│   ├── loading.tsx         # Root loading state
│   ├── not-found.tsx       # 404 page
│   └── globals.css         # Global styles
├── components/              # React components
│   ├── checkout/           # Checkout components
│   ├── ErrorState.tsx      # Reusable error display
│   ├── LoadingSpinner.tsx  # Loading indicator
│   ├── MobileMenu.tsx      # Mobile navigation
│   ├── Header.tsx          # Site header
│   └── CartIcon.tsx        # Cart button with count
├── hooks/                   # Custom React hooks
│   ├── useProducts.ts      # Product data fetching
│   ├── useCart.ts          # Cart state management
│   └── useOrders.ts        # Order data fetching
├── lib/                     # Utility functions
│   ├── firebase.ts         # Firebase configuration
│   ├── stripe.ts           # Stripe configuration
│   └── constants.ts        # App constants
├── services/               # Business logic and API calls
│   ├── productService.ts   # Product operations
│   ├── orderService.ts     # Order operations
│   └── checkoutService.ts  # Checkout operations
├── types/                   # TypeScript type definitions
│   └── index.ts            # Shared types
├── context/                # React contexts
│   └── CartContext.tsx     # Shopping cart context
├── providers/              # Context providers
│   └── QueryProvider.tsx   # React Query provider
├── scripts/                # Utility scripts
│   └── seed-products.ts    # Database seeding
└── .env.local             # Environment variables (not committed)
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server on port 5577
npm run build        # Build for production
npm start            # Start production server
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint

# Database
npm run seed         # Seed Firestore with sample products
```

## Environment Variables

All required environment variables are documented in `.env.example`. Copy it to `.env.local` and fill in your values.

### Required for Production

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | Firebase Console > Project Settings |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard > API keys |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard > API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Stripe Dashboard > Webhooks |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` | Use local Firebase emulators | `false` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Google Analytics measurement ID | Optional |

## Development Workflow

1. Start the dev server: `npm run dev`
2. The app runs on `http://localhost:5577`
3. React Query Devtools will appear in the bottom-left corner
4. Make changes - the app auto-reloads with hot module replacement
5. Use Firebase Emulators for local development (optional)

## Deployment

See [DEPLOYMENT.md](./.docs/DEPLOYMENT.md) for detailed deployment instructions to Vercel.

## Troubleshooting

### Firebase Connection Issues

If you see Firebase warnings in the console:
1. Verify all environment variables are set in `.env.local`
2. Restart the dev server after changing environment variables
3. Check that your Firebase project is active in the console
4. Ensure Firestore database is created and has security rules

### Firebase Emulator Issues

If emulators won't start:
1. Check ports 3476-3479 are not in use
2. Run `firebase emulators:start --only firestore,auth` to start specific emulators
3. Clear emulator data: Delete `firebase-export-*` folders

### Stripe Payment Issues

1. Verify you're using test API keys in development
2. Check that webhook secret matches the Stripe CLI output
3. Ensure Stripe CLI is forwarding to the correct port (5577)
4. Test with Stripe test card numbers

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Type Errors

```bash
# Run type checking
npm run type-check

# If types are out of sync, restart TypeScript server in your editor
```

## Security Notes

- Never commit `.env.local` or any files containing secrets
- Use environment variables for all sensitive data
- The `.gitignore` file is configured to exclude sensitive files
- Stripe webhook signatures are verified on all webhook endpoints
- Firebase security rules should be properly configured in production
- Always use test API keys during development

## Features in Detail

### Product Filtering

- Filter by era (1950s-2010s)
- Filter by category (dresses, jackets, accessories, etc.)
- Filter by condition (excellent, good, fair)
- Filter by size (XS-3XL)
- Price range filtering (under €50, €50-100, €100-200, €200+)
- Sort by newest, price low-to-high, price high-to-low
- Search functionality

### Checkout Flow

1. Review cart items with quantity adjustment
2. Enter shipping information (validated)
3. Provide payment details via Stripe Elements
4. Order confirmation with order number
5. Webhook processing for payment status updates

### Admin Features

- View all orders in a responsive table
- Filter orders by status (pending, processing, shipped, delivered, cancelled)
- Update order status with confirmation
- View detailed order information
- Customer information display
- Mobile-responsive admin panel

### Mobile Responsiveness

- Mobile navigation menu with smooth slide-in animation
- WCAG-compliant touch targets (44x44px minimum)
- Mobile-friendly forms (text-base to prevent iOS zoom)
- Responsive grid layouts throughout
- Sticky header with backdrop blur
- Mobile-optimized shopping cart
- Touch-friendly filter controls

### Error Handling

- Global error boundary for unhandled errors
- Custom 404 page with helpful navigation
- Loading states with skeleton loaders matching page layouts
- User-friendly error messages (no technical jargon)
- Retry functionality for failed API operations
- Graceful degradation for missing data

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Headless UI Docs](https://headlessui.com)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run type checking: `npm run type-check`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'feat: add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub or consult the troubleshooting section above.
