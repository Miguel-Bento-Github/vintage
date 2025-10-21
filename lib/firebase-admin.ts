import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Firebase Admin SDK initialization
 * This runs server-side only and bypasses Firestore security rules
 */

// Initialize Firebase Admin
if (!getApps().length) {
  // For local development and production
  // Firebase Admin SDK automatically uses Application Default Credentials in production
  // For local dev, you can use a service account key file

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

// Export Firestore instance
export const adminDb = getFirestore();
