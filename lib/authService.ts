import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Sign in admin user with email and password
 * @param email - Admin email address
 * @param password - Admin password
 * @returns User object if successful
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user is an admin
    const isAdmin = await checkIfAdmin(user.uid);

    if (!isAdmin) {
      // Sign out non-admin users
      await signOut(auth);
      return {
        success: false,
        error: 'Access denied. You are not authorized as an admin.',
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error signing in:', error);

    // Handle specific Firebase Auth errors
    const errorCode = (error as { code?: string }).code;
    let errorMessage = 'Failed to sign in';

    switch (errorCode) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      default:
        errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Sign out current user
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Check if a user is an admin
 * @param userId - User UID from Firebase Auth
 * @returns True if user is in the admins collection
 */
export async function checkIfAdmin(userId: string): Promise<boolean> {
  try {
    const adminDocRef = doc(db, 'admins', userId);
    const adminDoc = await getDoc(adminDocRef);

    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get current authenticated user
 * @returns Current user or null
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Subscribe to authentication state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
