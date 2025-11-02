import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * Verify Firebase ID token from request headers
 * Returns the decoded token if valid, null otherwise
 */
export async function verifyAuthToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user has admin role by checking the admins collection
 */
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const adminDoc = await adminDb.collection('admins').doc(uid).get();
    return adminDoc.exists;
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

/**
 * Verify request is from authenticated admin
 * Returns admin UID if authenticated, null otherwise
 */
export async function verifyAdminAuth(request: NextRequest): Promise<string | null> {
  const decodedToken = await verifyAuthToken(request);

  if (!decodedToken) {
    return null;
  }

  const adminStatus = await isAdmin(decodedToken.uid);

  if (!adminStatus) {
    return null;
  }

  return decodedToken.uid;
}
