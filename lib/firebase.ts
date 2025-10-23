import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Get Firebase configuration from environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Validate Firebase configuration
const validateFirebaseConfig = (): void => {
  // Check the actual config values directly (not process.env)
  // because Next.js replaces env vars at build time
  const missingVars: string[] = [];

  if (!firebaseConfig.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!firebaseConfig.messagingSenderId) missingVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!firebaseConfig.appId) missingVars.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  if (missingVars.length > 0) {
    console.warn(
      `Missing Firebase environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file. See README for setup instructions.'
    );
  }
};

// Validate configuration on initialization
validateFirebaseConfig();

// Initialize Firebase (singleton pattern - only initialize once)
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const auth: Auth = getAuth(app);

// Track if emulators have been connected (prevents double-initialization)
let emulatorsConnected = false;

// Connect to emulators only when explicitly enabled
// Set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true in .env.local to enable
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  // Connect on both server and client side for full SSR support
  if (!emulatorsConnected) {
    try {
      connectFirestoreEmulator(db, 'localhost', 3476);
      connectAuthEmulator(auth, 'http://localhost:3477', { disableWarnings: true });
      connectStorageEmulator(storage, 'localhost', 3478);
      emulatorsConnected = true;
    } catch {
      // Emulators already connected (hot reload in dev) - this is fine
      if (!emulatorsConnected) {
        emulatorsConnected = true;
      }
    }
  }
}

// Export the app instance for additional configuration if needed
export default app;

// Type exports for use in other files
export type { FirebaseApp, Firestore, FirebaseStorage, Auth };
