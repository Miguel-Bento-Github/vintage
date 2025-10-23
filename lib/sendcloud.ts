/**
 * SendCloud API Integration
 *
 * SendCloud provides multi-carrier shipping for Europe with support for:
 * - PostNL (Netherlands - 60% market share)
 * - DHL (Europe & International)
 * - UPS (International)
 * - DPD (Europe)
 * - GLS (Europe)
 *
 * API Documentation: https://docs.sendcloud.sc/api/v2/
 *
 * Setup:
 * 1. Sign up at https://www.sendcloud.com
 * 2. Get API credentials from Settings > Integration
 * 3. Add to .env.local:
 *    SENDCLOUD_PUBLIC_KEY=your_public_key
 *    SENDCLOUD_SECRET_KEY=your_secret_key
 */

interface SendCloudAddress {
  name: string;
  company_name?: string;
  address: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country: string; // ISO 3166-1 alpha-2 code
  email?: string;
  telephone?: string;
}

interface SendCloudParcel {
  name: string;
  weight: string; // in kg (e.g., "0.5")
  length?: string; // in cm
  width?: string; // in cm
  height?: string; // in cm
  country: string; // destination country code
  postal_code: string;
}

interface SendCloudShippingMethod {
  id: number;
  name: string;
  carrier: string;
  price: number;
  min_weight: number;
  max_weight: number;
  countries: {
    iso_2: string;
    name: string;
    price: number;
  }[];
  service_point_input?: string;
}

interface SendCloudQuoteResponse {
  shipment: {
    id: number;
    carrier: string;
    service_point?: unknown;
    shipping_method: number;
    shipping_method_checkout_name: string;
  };
  price: {
    currency: string;
    amount: string; // Price including VAT
  };
}

/**
 * SendCloud API Client
 */
class SendCloudClient {
  private publicKey: string;
  private secretKey: string;
  private baseUrl = 'https://panel.sendcloud.sc/api/v2';

  constructor(publicKey: string, secretKey: string) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
  }

  /**
   * Get authorization header for SendCloud API
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.publicKey}:${this.secretKey}`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Get available shipping methods
   * @returns List of shipping methods configured in SendCloud
   */
  async getShippingMethods(): Promise<SendCloudShippingMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/shipping_methods`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`SendCloud API error: ${response.status}`);
      }

      const data = await response.json();
      return data.shipping_methods || [];
    } catch (error) {
      console.error('Error fetching SendCloud shipping methods:', error);
      throw error;
    }
  }

  /**
   * Get shipping quote for a parcel
   * @param parcel - Parcel details (weight, destination)
   * @param fromAddress - Sender address (warehouse)
   * @returns Shipping quote with carrier and price
   */
  async getShippingQuote(
    parcel: SendCloudParcel,
    fromAddress: SendCloudAddress
  ): Promise<{
    carrier: string;
    service: string;
    price: number;
    currency: string;
    deliveryDays?: string;
  } | null> {
    try {
      // Get available shipping methods
      const methods = await this.getShippingMethods();

      // Filter methods for destination country
      const availableMethods = methods.filter(method =>
        method.countries.some(c => c.iso_2 === parcel.country)
      );

      if (availableMethods.length === 0) {
        console.warn(`No shipping methods available for ${parcel.country}`);
        return null;
      }

      // Find cheapest method that supports the weight
      const weightKg = parseFloat(parcel.weight);
      const suitableMethods = availableMethods.filter(
        method => weightKg >= method.min_weight && weightKg <= method.max_weight
      );

      if (suitableMethods.length === 0) {
        console.warn(`No shipping methods support weight ${weightKg}kg to ${parcel.country}`);
        return null;
      }

      // Get price for each method and find cheapest
      const methodsWithPrices = suitableMethods.map(method => {
        const countryData = method.countries.find(c => c.iso_2 === parcel.country);
        return {
          carrier: method.carrier,
          service: method.name,
          price: countryData?.price || method.price,
          currency: 'EUR', // SendCloud typically uses EUR
        };
      });

      // Filter out invalid methods (unstamped letters, free methods, etc.)
      const validMethods = methodsWithPrices.filter(method => {
        const lowerName = method.service.toLowerCase();
        // Exclude unstamped letters, letters, and zero-price methods
        if (lowerName.includes('unstamped') || lowerName.includes('letter')) {
          return false;
        }
        // Exclude zero-price methods (likely invalid for parcels)
        if (method.price === 0) {
          return false;
        }
        return true;
      });

      if (validMethods.length === 0) {
        console.warn('No valid parcel shipping methods found, falling back to all methods');
        // Fallback to any method if no valid parcel methods found
        methodsWithPrices.sort((a, b) => a.price - b.price);
        return methodsWithPrices[0];
      }

      // Sort by price and return cheapest valid method
      validMethods.sort((a, b) => a.price - b.price);

      return validMethods[0];
    } catch (error) {
      console.error('Error getting SendCloud shipping quote:', error);
      return null;
    }
  }

  /**
   * Create a shipment/label
   * Note: This is for future implementation when you're ready to create actual shipping labels
   */
  async createShipment(
    toAddress: SendCloudAddress,
    fromAddress: SendCloudAddress,
    parcel: SendCloudParcel,
    shippingMethodId: number
  ): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/parcels`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parcel: {
            ...parcel,
            shipment: {
              id: shippingMethodId,
            },
            sender_address: fromAddress.address,
            to_address: toAddress.address,
            to_city: toAddress.city,
            to_postal_code: toAddress.postal_code,
            to_country: toAddress.country,
            from_address: fromAddress.address,
            from_city: fromAddress.city,
            from_postal_code: fromAddress.postal_code,
            from_country: fromAddress.country,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`SendCloud API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating SendCloud shipment:', error);
      throw error;
    }
  }
}

/**
 * Get SendCloud client instance
 * Uses environment variables for API credentials
 */
export function getSendCloudClient(): SendCloudClient | null {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;

  if (!publicKey || !secretKey) {
    console.warn('SendCloud API credentials not configured. Using fallback static rates.');
    return null;
  }

  return new SendCloudClient(publicKey, secretKey);
}

/**
 * Get real-time shipping rate from SendCloud
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param weightGrams - Package weight in grams
 * @param postalCode - Destination postal code (optional, for more accurate rates)
 * @returns Shipping rate or null if unavailable
 */
export async function getSendCloudRate(
  countryCode: string,
  weightGrams: number = 500,
  postalCode?: string
): Promise<{
  carrier: string;
  service: string;
  price: number;
  currency: string;
} | null> {
  const client = getSendCloudClient();

  if (!client) {
    return null; // Will fallback to static rates
  }

  try {
    // Get warehouse address from environment variables
    const warehouseAddress: SendCloudAddress = {
      name: process.env.WAREHOUSE_NAME || 'Vintage Store',
      address: process.env.WAREHOUSE_ADDRESS || 'Warehouse Address',
      city: process.env.WAREHOUSE_CITY || 'Amsterdam',
      postal_code: process.env.WAREHOUSE_POSTAL_CODE || '1012AB',
      country: process.env.WAREHOUSE_COUNTRY || 'NL',
    };

    // Convert grams to kg for SendCloud
    const weightKg = (weightGrams / 1000).toFixed(2);

    const quote = await client.getShippingQuote(
      {
        name: 'Vintage Clothing',
        weight: weightKg,
        country: countryCode,
        postal_code: postalCode || '',
        // Typical clothing package dimensions (can be customized)
        length: '30', // cm
        width: '25',  // cm
        height: '5',  // cm
      },
      warehouseAddress
    );

    return quote;
  } catch (error) {
    console.error('Error fetching SendCloud rate:', error);
    return null;
  }
}

/**
 * Get supported carriers from SendCloud account
 */
export async function getSendCloudCarriers(): Promise<string[]> {
  const client = getSendCloudClient();

  if (!client) {
    return [];
  }

  try {
    const methods = await client.getShippingMethods();
    const carriers = [...new Set(methods.map(m => m.carrier))];
    return carriers;
  } catch (error) {
    console.error('Error fetching SendCloud carriers:', error);
    return [];
  }
}

export type { SendCloudAddress, SendCloudParcel, SendCloudShippingMethod };
