/**
 * Script to set admin custom claims for a Firebase user
 * Usage: npm run set-admin <email>
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

// Configure emulator before initialization
if (useEmulator) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:3477';
  console.log('🔧 Using Firebase Auth emulator');
}

// Initialize Firebase Admin
if (useEmulator) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  });
} else {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const auth = getAuth();

async function setAdminClaim(email: string) {
  try {
    // Get user by email
    const user = await auth.getUserByEmail(email);

    console.log('Found user:', {
      uid: user.uid,
      email: user.email,
      currentClaims: user.customClaims,
    });

    // Set admin custom claim
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
    });

    console.log('✅ Admin claim set successfully for:', email);
    console.log('⚠️  User must sign out and sign in again for claims to take effect.');

  } catch (error) {
    console.error('❌ Error setting admin claim:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Usage: npm run set-admin <email>');
  process.exit(1);
}

setAdminClaim(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
