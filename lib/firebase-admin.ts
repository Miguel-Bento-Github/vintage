import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK initialization
 * This runs server-side only and bypasses Firestore security rules
 */

let adminDb: Firestore;
let adminAuth: Auth;
let isEmulatorConfigured = false;

// Initialize Firebase Admin
if (!getApps().length) {
  // For local development and production
  // Firebase Admin SDK automatically uses Application Default Credentials in production
  // For local dev, you can use a service account key file

  const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

  if (useEmulator) {
    // When using emulator, we don't need real credentials
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
    });
  } else {
    // Production/real Firebase
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

  // Configure emulators BEFORE getting service instances
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true' && !isEmulatorConfigured) {
    // Set Auth emulator environment variable for Admin SDK
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:3477';
    isEmulatorConfigured = true;
    console.log('🔧 [Admin] Configured Firebase Auth emulator (localhost:3477)');
  }

  // Get Firestore and Auth instances AFTER emulator configuration
  adminDb = getFirestore();
  adminAuth = getAuth();

  // Configure Firestore to use emulators in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
    adminDb.settings({
      host: 'localhost:3476',
      ssl: false,
    });
    console.log('🔧 [Admin] Connected to Firestore emulator (localhost:3476)');
  }
} else {
  // App already initialized, just get the existing instances
  adminDb = getFirestore();
  adminAuth = getAuth();
}

export { adminDb, adminAuth };
