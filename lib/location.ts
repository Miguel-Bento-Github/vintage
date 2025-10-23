/**
 * Location detection utilities
 * Auto-detect user's country for better UX
 */

interface LocationData {
  country: string; // ISO 3166-1 alpha-2 code (e.g., 'NL', 'US')
  countryName: string;
  city?: string;
  region?: string;
}

/**
 * Detect user's country using IP geolocation
 * Uses ipapi.co free service (1000 requests/day, no API key needed)
 *
 * Falls back to browser's locale if API fails
 *
 * @returns Country code (ISO 3166-1 alpha-2) or null if detection fails
 */
export async function detectUserCountry(): Promise<string | null> {
  try {
    // First, try to get from localStorage (cached)
    const cached = localStorage.getItem('detected-country');
    if (cached) {
      const { country, timestamp } = JSON.parse(cached);
      // Cache for 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return country;
      }
    }

    // Fetch from IP geolocation API
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }

    const data = await response.json();

    if (data.country_code) {
      // Cache the result
      localStorage.setItem('detected-country', JSON.stringify({
        country: data.country_code,
        timestamp: Date.now(),
      }));

      return data.country_code;
    }

    // Fallback to browser locale
    return getCountryFromBrowserLocale();
  } catch (error) {
    console.error('Error detecting country:', error);
    // Fallback to browser locale
    return getCountryFromBrowserLocale();
  }
}

/**
 * Get country code from browser's locale settings
 * Example: 'en-US' → 'US', 'nl-NL' → 'NL'
 */
function getCountryFromBrowserLocale(): string | null {
  try {
    const locale = navigator.language || navigator.languages?.[0];
    if (!locale) return null;

    // Extract country code from locale (e.g., 'en-US' → 'US')
    const parts = locale.split('-');
    if (parts.length === 2) {
      return parts[1].toUpperCase();
    }

    // Map common language-only locales to likely countries
    const languageToCountry: Record<string, string> = {
      'en': 'US',
      'nl': 'NL',
      'de': 'DE',
      'fr': 'FR',
      'es': 'ES',
      'it': 'IT',
      'pt': 'PT',
      'ja': 'JP',
      'zh': 'CN',
      'ko': 'KR',
    };

    return languageToCountry[parts[0]] || null;
  } catch (error) {
    console.error('Error getting country from browser locale:', error);
    return null;
  }
}

/**
 * Get detailed location data (optional, for future use)
 */
export async function detectUserLocation(): Promise<LocationData | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');

    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }

    const data = await response.json();

    return {
      country: data.country_code,
      countryName: data.country_name,
      city: data.city,
      region: data.region,
    };
  } catch (error) {
    console.error('Error detecting location:', error);
    return null;
  }
}

/**
 * Clear cached country detection (useful for testing)
 */
export function clearCountryCache(): void {
  localStorage.removeItem('detected-country');
}
