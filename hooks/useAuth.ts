'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  signInAdmin,
  signOutAdmin,
  checkIfAdmin,
  onAuthStateChange,
} from '@/lib/authService';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage authentication state
 * Listens to Firebase Auth state changes and checks admin status
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // User is signed in, check if admin
        const isAdmin = await checkIfAdmin(user.uid);

        setAuthState({
          user,
          isAdmin,
          loading: false,
          error: null,
        });
      } else {
        // User is signed out
        setAuthState({
          user: null,
          isAdmin: false,
          loading: false,
          error: null,
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Sign in as admin
   */
  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    const result = await signInAdmin(email, password);

    if (result.success) {
      // Auth state will update via onAuthStateChange listener
      return { success: true as const };
    } else {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: result.error,
      }));
      return { success: false as const, error: result.error };
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      await signOutAdmin();
      // Auth state will update via onAuthStateChange listener
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to sign out',
      }));
    }
  };

  return {
    user: authState.user,
    isAdmin: authState.isAdmin,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signOut,
  };
}
