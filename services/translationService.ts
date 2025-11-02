import { auth } from '@/lib/firebase';
import type { Locale } from '@/i18n';

export interface TranslateRequest {
  title: string;
  description: string;
  conditionNotes?: string;
  targetLang: Locale;
}

export interface TranslationResult {
  title: string;
  description: string;
  conditionNotes?: string;
}

/**
 * Get auth token for authenticated API calls
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Translate product fields to target language
 */
export async function translateProduct(
  request: TranslateRequest
): Promise<{ success: true; data: TranslationResult } | { success: false; error: string }> {
  try {
    const token = await getAuthToken();

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.translation,
    };
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
