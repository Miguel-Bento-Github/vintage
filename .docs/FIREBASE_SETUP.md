# Firebase Setup Complete ✅

Your Firebase project **vintage-c534e** has been initialized and configured!

## What Was Set Up

### 1. Security Rules
- ✅ **Firestore Rules** (`firestore.rules`) - Secure database access
  - Products: Public read, admin-only write
  - Orders: Customers see own orders, admins see all
  - Admin collection protected

- ✅ **Storage Rules** (`storage.rules`) - Secure file uploads
  - Product images: Public read, admin-only upload/delete

### 2. Database Indexes
- ✅ **Products** indexes for filtering by:
  - Stock status + date
  - Era + date
  - Category + date
  - Featured status + date

- ✅ **Orders** indexes for filtering by:
  - Customer email + date
  - Order status + date

### 3. Emulators Configured
- ✅ Authentication Emulator (port 9099)
- ✅ Firestore Emulator (port 8080)
- ✅ Storage Emulator (port 9199)
- ✅ Emulator UI (http://localhost:4000)

## Next Steps

### 1. Get Firebase Credentials

Go to [Firebase Console](https://console.firebase.google.com/project/vintage-c534e/overview):

1. Click the **gear icon** → Project settings
2. Scroll down to "Your apps"
3. Find your web app or create one
4. Copy the config values

### 2. Update .env.local

Copy the template and fill in your credentials:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Then edit `.env.local` with your Firebase config values.

### 3. Deploy Security Rules (Required!)

The security rules are only on your computer. Deploy them to Firebase:

\`\`\`bash
# Deploy everything (rules + indexes)
firebase deploy

# Or deploy rules only
firebase deploy --only firestore:rules,storage:rules

# Or deploy indexes only
firebase deploy --only firestore:indexes
\`\`\`

### 4. Enable Firebase Services in Console

Make sure these are enabled in your Firebase Console:

- ✅ **Firestore Database** - Create database in Europe (eur3)
- ✅ **Storage** - Initialize storage
- ✅ **Authentication** - Enable Email/Password provider

### 5. Create Admin User

1. Go to Authentication → Users
2. Add a user with your email
3. Copy the User UID
4. Go to Firestore Database
5. Create collection: `admins`
6. Create document with your UID as document ID
7. Add field: `email` (string) with your email

## Using Emulators (Development)

### Start Emulators

\`\`\`bash
firebase emulators:start
\`\`\`

This opens:
- Emulator UI: http://localhost:4000
- Auth: localhost:9099
- Firestore: localhost:8080
- Storage: localhost:9199

### Connect Your App to Emulators

The app will automatically detect running emulators. Just make sure both are running:

\`\`\`bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: Firebase emulators
firebase emulators:start
\`\`\`

## File Structure

\`\`\`
vintage-store/
├── .firebaserc           # Firebase project config
├── firebase.json         # Firebase services config
├── firestore.rules       # Database security rules
├── firestore.indexes.json # Database performance indexes
├── storage.rules         # File storage security rules
└── .env.local           # Firebase credentials (create this)
\`\`\`

## Troubleshooting

### "Permission denied" errors
- Deploy your security rules: `firebase deploy --only firestore:rules,storage:rules`
- Verify your user UID is in the `admins` collection

### Can't connect to Firebase
- Check `.env.local` has all required values
- Restart dev server after changing `.env.local`
- Verify Firebase services are enabled in console

### Indexes not working
- Deploy indexes: `firebase deploy --only firestore:indexes`
- Or click the auto-generated link in error messages

## Ready to Code!

Once you've completed steps 1-5 above, you're ready to continue with:
- **Prompt 3**: Database Schema Types
- **Prompt 4**: Product Service Layer

Run `npm run dev` and start building! 🚀
