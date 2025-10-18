import {
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError
} from 'firebase/firestore';
import { StorageError } from 'firebase/storage';
import { AuthError, User } from 'firebase/auth';

// ============================================================================
// RE-EXPORT FIREBASE TYPES
// ============================================================================

export type {
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError,
  StorageError,
  AuthError,
  User
};

// ============================================================================
// FIREBASE SERVICE RESPONSE TYPES
// ============================================================================

export interface FirebaseServiceSuccess<T> {
  success: true;
  data: T;
}

export interface FirebaseServiceError {
  success: false;
  error: string;
  code?: string;
}

export type FirebaseServiceResponse<T> = FirebaseServiceSuccess<T> | FirebaseServiceError;

// ============================================================================
// IMAGE UPLOAD TYPES
// ============================================================================

export type UploadProgressCallback = (progress: number) => void;

export interface ImageUploadResult {
  url: string;
  path: string;
  name: string;
}

export interface BatchUploadResult {
  successful: ImageUploadResult[];
  failed: Array<{ file: File; error: string }>;
}
