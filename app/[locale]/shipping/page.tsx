import { getTranslations } from 'next-intl/server';
import { SHIPPING_RATES, getCountriesByZone, getCustomsInfo } from '@/lib/shipping';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('shipping');

  return {
    title: 'Shipping Policy | Vintage Store',
    description: 'Learn about our international shipping rates, delivery times, and customs information for vintage clothing.',
  };
}

export default async function ShippingPolicyPage() {
  const t = await getTranslations('shipping');
  const countriesByZone = getCountriesByZone();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shipping Policy</h1>
          <p className="text-lg text-gray-600">
            We ship authentic vintage clothing worldwide. Review our shipping zones, rates, and estimated delivery times below.
          </p>
        </div>

        {/* Shipping Zones & Rates */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Zones & Rates</h2>

          <div className="space-y-6">
            {/* Domestic Shipping */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Domestic (Spain)</h3>
                  <p className="text-sm text-gray-600 mt-1">2-3 business days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-700">${SHIPPING_RATES.domestic.flatRate}</p>
                  <p className="text-xs text-gray-500">flat rate</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {countriesByZone.domestic?.map((country) => (
                  <span
                    key={country.code}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {country.name}
                  </span>
                ))}
              </div>
            </div>

            {/* European Shipping */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Europe</h3>
                  <p className="text-sm text-gray-600 mt-1">5-7 business days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-700">${SHIPPING_RATES.europe.flatRate}</p>
                  <p className="text-xs text-gray-500">flat rate</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {countriesByZone.europe?.map((country) => (
                  <span
                    key={country.code}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {country.name}
                  </span>
                ))}
              </div>
            </div>

            {/* North America */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">North America</h3>
                  <p className="text-sm text-gray-600 mt-1">7-14 business days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-700">${SHIPPING_RATES['north-america'].flatRate}</p>
                  <p className="text-xs text-gray-500">flat rate</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {countriesByZone['north-america']?.map((country) => (
                  <span
                    key={country.code}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {country.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Asia-Pacific */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Asia-Pacific</h3>
                  <p className="text-sm text-gray-600 mt-1">10-21 business days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-700">${SHIPPING_RATES['asia-pacific'].flatRate}</p>
                  <p className="text-xs text-gray-500">flat rate</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {countriesByZone['asia-pacific']?.map((country) => (
                  <span
                    key={country.code}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {country.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Rest of World */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Rest of World</h3>
                  <p className="text-sm text-gray-600 mt-1">14-28 business days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-700">${SHIPPING_RATES['rest-of-world'].flatRate}</p>
                  <p className="text-xs text-gray-500">flat rate</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {countriesByZone['rest-of-world']?.map((country) => (
                  <span
                    key={country.code}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {country.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Processing & Tracking */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Processing & Tracking</h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Processing Time</h3>
              <p>
                Orders are typically processed and shipped within 2-3 business days. You will receive an email notification
                with tracking information once your order ships.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tracking Information</h3>
              <p>
                All shipments include tracking. Once your order ships, you&apos;ll receive a tracking number via email.
                You can use this to monitor your package&apos;s journey.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Times</h3>
              <p>
                Estimated delivery times begin from the ship date, not the order date. Delays may occur due to customs
                clearance for international shipments or during peak holiday periods.
              </p>
            </div>
          </div>
        </div>

        {/* Customs & Duties */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customs & Import Duties</h2>

          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <strong>Important:</strong> International customers are responsible for any customs duties, taxes, or fees
                imposed by their country. These charges are not included in our shipping rates and vary by destination.
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Vintage/Used Goods Advantage</h3>
                <p>
                  Our items are authentic vintage and second-hand clothing. Many countries offer reduced or exempt customs
                  duties for used goods. All shipments are clearly marked as &quot;Used Vintage Clothing&quot; to help
                  facilitate customs clearance.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customs Declaration</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>All items declared as used/vintage clothing</li>
                  <li>HS Code: 6309.00 (Worn clothing and other worn articles)</li>
                  <li>Value: Actual purchase price</li>
                  <li>Origin: Varies by vintage item sourcing</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">European Union</h3>
                <p>
                  {getCustomsInfo('europe').taxExemption}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Other Regions</h3>
                <p>
                  Customs duties vary by country and item value. We recommend checking with your local customs office for
                  specific rates. As vintage/used goods, our items often qualify for reduced rates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Restrictions */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Restrictions</h2>

          <div className="space-y-4 text-gray-700">
            <p>
              While we strive to ship worldwide, some restrictions may apply:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Some countries restrict or prohibit imports of second-hand clothing for health or economic reasons</li>
              <li>Certain remote or sanctioned regions may not be serviceable</li>
              <li>Additional shipping charges may apply for islands or remote territories</li>
            </ul>

            <p className="text-sm italic">
              If you&apos;re unsure whether we can ship to your location, please contact us before placing your order.
            </p>
          </div>
        </div>

        {/* Lost or Damaged Packages */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lost or Damaged Packages</h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Lost Packages</h3>
              <p>
                If your package appears lost in transit, please contact us immediately. We will work with the shipping
                carrier to locate your package. After a reasonable investigation period, we may issue a refund or replacement.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Damaged Items</h3>
              <p>
                If your item arrives damaged, please contact us within 48 hours with photos of the damage and packaging.
                We will arrange for a replacement or refund as appropriate.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Incorrect Address</h3>
              <p>
                Please ensure your shipping address is correct at checkout. We cannot be responsible for packages shipped to
                incorrect addresses provided by the customer. Address changes after shipment may incur additional fees.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">
            Have questions about shipping? Contact us and we&apos;ll be happy to help!
          </p>
        </div>
      </div>
    </div>
  );
}
