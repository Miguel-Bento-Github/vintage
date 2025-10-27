'use client';

import { useTranslations } from 'next-intl';
import { SHIPPING_RATES, getCountriesByZone } from '@/lib/shipping';
import Price from '@/components/Price';

export default function ShippingPolicyPage() {
  const t = useTranslations('shipping');
  const countriesByZone = getCountriesByZone();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('pageTitle')}</h1>
          <p className="text-lg text-gray-600">
            {t('pageDescription')}
          </p>
        </div>

        {/* Shipping Zones & Rates */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('zonesTitle')}</h2>

          <div className="space-y-6">
            {/* Domestic Shipping */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('domesticTitle')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('domesticDays')}</p>
                </div>
                <div className="text-right">
                  <Price amount={SHIPPING_RATES.domestic.flatRate} className="text-2xl font-bold text-amber-700" />
                  <p className="text-xs text-gray-500">{t('flatRate')}</p>
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
                  <h3 className="text-xl font-semibold text-gray-900">{t('europeTitle')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('europeDays')}</p>
                </div>
                <div className="text-right">
                  <Price amount={SHIPPING_RATES.europe.flatRate} className="text-2xl font-bold text-amber-700" />
                  <p className="text-xs text-gray-500">{t('flatRate')}</p>
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
                  <h3 className="text-xl font-semibold text-gray-900">{t('northAmericaTitle')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('northAmericaDays')}</p>
                </div>
                <div className="text-right">
                  <Price amount={SHIPPING_RATES['north-america'].flatRate} className="text-2xl font-bold text-amber-700" />
                  <p className="text-xs text-gray-500">{t('flatRate')}</p>
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
                  <h3 className="text-xl font-semibold text-gray-900">{t('asiaPacificTitle')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('asiaPacificDays')}</p>
                </div>
                <div className="text-right">
                  <Price amount={SHIPPING_RATES['asia-pacific'].flatRate} className="text-2xl font-bold text-amber-700" />
                  <p className="text-xs text-gray-500">{t('flatRate')}</p>
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
                  <h3 className="text-xl font-semibold text-gray-900">{t('restOfWorldTitle')}</h3>
                  <p className="text-sm text-gray-600 mt-1">{t('restOfWorldDays')}</p>
                </div>
                <div className="text-right">
                  <Price amount={SHIPPING_RATES['rest-of-world'].flatRate} className="text-2xl font-bold text-amber-700" />
                  <p className="text-xs text-gray-500">{t('flatRate')}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('processingTitle')}</h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('processingTimeTitle')}</h3>
              <p>{t('processingTimeText')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('trackingInfoTitle')}</h3>
              <p>{t('trackingInfoText')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('deliveryTimesTitle')}</h3>
              <p>{t('deliveryTimesText')}</p>
            </div>
          </div>
        </div>

        {/* Customs & Duties */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('customsTitle')}</h2>

          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <strong>{t('customsImportant')}</strong> {t('customsImportantText')}
              </p>
            </div>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('vintageAdvantageTitle')}</h3>
                <p>{t('vintageAdvantageText')}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('customsDeclarationTitle')}</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t('customsPoint1')}</li>
                  <li>{t('customsPoint2')}</li>
                  <li>{t('customsPoint3')}</li>
                  <li>{t('customsPoint4')}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('euTitle')}</h3>
                <p>{t('euText')}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('otherRegionsTitle')}</h3>
                <p>{t('otherRegionsText')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Restrictions */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('restrictionsTitle')}</h2>

          <div className="space-y-4 text-gray-700">
            <p>{t('restrictionsIntro')}</p>

            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>{t('restrictionPoint1')}</li>
              <li>{t('restrictionPoint2')}</li>
              <li>{t('restrictionPoint3')}</li>
            </ul>

            <p className="text-sm italic">{t('restrictionsNote')}</p>
          </div>
        </div>

        {/* Lost or Damaged Packages */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('lostDamagedTitle')}</h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('lostPackagesTitle')}</h3>
              <p>{t('lostPackagesText')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('damagedItemsTitle')}</h3>
              <p>{t('damagedItemsText')}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('incorrectAddressTitle')}</h3>
              <p>{t('incorrectAddressText')}</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">{t('contactFooter')}</p>
        </div>
      </div>
    </div>
  );
}
