# Vintage Store - E-Commerce Platform

A custom vintage clothing e-commerce platform built with Next.js 14, Firebase, and Stripe. Designed to maximize profit margins by eliminating platform fees.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Backend:** Firebase (Firestore, Storage, Auth)
- **Payments:** Stripe
- **Deployment:** Vercel

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

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "vintage-store")
4. Disable Google Analytics (optional, can enable later)
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

## Project Structure

```
vintage-store/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles with brand colors
├── components/            # React components
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/                   # Core utilities
│   ├── firebase.ts        # Firebase initialization
│   └── queryClient.ts     # TanStack Query config
├── providers/             # Context providers
│   └── QueryProvider.tsx  # React Query provider
├── services/              # Business logic & API calls
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
│   └── firebase.ts        # Firebase type helpers
├── context/               # React contexts
└── .env.local            # Environment variables (not committed)
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Required variables in `.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe (add these later)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
```

## Development Workflow

1. Start the dev server: `npm run dev`
2. The app runs on `http://localhost:3000` (or 3001 if 3000 is in use)
3. React Query Devtools will appear in the bottom-left corner (flower icon)
4. Make changes - the app auto-reloads

## Troubleshooting

### Firebase Connection Issues

If you see Firebase warnings in the console:
1. Verify all environment variables are set in `.env.local`
2. Restart the dev server after changing environment variables
3. Check that your Firebase project is active in the console

### Permission Denied Errors

If you get permission errors:
1. Verify Firestore rules are published
2. Check that you're authenticated (for admin operations)
3. Verify your user UID is in the `admins` collection

### Missing Indexes

If queries fail with "requires an index":
1. Click the link in the error message to auto-create the index
2. Or manually create the index in Firebase Console > Firestore > Indexes

## Next Steps

After completing Firebase setup:
1. Proceed with **Prompt 3**: Database Schema Types
2. Then **Prompt 4**: Product Service Layer
3. Continue through the implementation plan

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## License

MIT
