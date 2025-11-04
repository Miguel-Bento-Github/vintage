import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function TaxPolicyPage() {
  const t = useTranslations('taxPolicy');
  const tFooter = useTranslations('footer');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                <strong className="font-semibold">{t('importantNotice')}</strong>{' '}
                {t('noticeDescription')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {/* What This Means */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('whatThisMeans')}</h2>
            <p className="text-gray-700 mb-4">{t('whatThisMeansDescription')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t('pricesExcludeTaxes')}</li>
              <li>{t('youAreResponsible')}</li>
              <li>{t('feesVaryByCountry')}</li>
              <li>{t('paidToCustoms')}</li>
            </ul>
          </div>

          {/* How It Works */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('howItWorks')}</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('step1Title')}</h3>
                  <p className="text-gray-700 text-sm">{t('step1Description')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('step2Title')}</h3>
                  <p className="text-gray-700 text-sm">{t('step2Description')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t('step3Title')}</h3>
                  <p className="text-gray-700 text-sm">{t('step3Description')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Guidelines */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('regionalGuidelines')}</h2>
            <p className="text-gray-700 mb-4">{t('regionalGuidelinesIntro')}</p>

            <div className="space-y-4">
              <div className="border-l-4 border-amber-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('euTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('euCustomerDescription')}</p>
              </div>

              <div className="border-l-4 border-amber-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('ukTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('ukCustomerDescription')}</p>
              </div>

              <div className="border-l-4 border-amber-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('usTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('usCustomerDescription')}</p>
              </div>

              <div className="border-l-4 border-amber-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('canadaTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('canadaCustomerDescription')}</p>
              </div>

              <div className="border-l-4 border-amber-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('australiaTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('australiaCustomerDescription')}</p>
              </div>

              <div className="border-l-4 border-amber-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('otherCountries')}</h3>
                <p className="text-gray-700 text-sm">{t('otherCountriesDescription')}</p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="p-6 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('haveQuestions')}</h2>
            <p className="text-gray-700 mb-4">{t('haveQuestionsDescription')}</p>
            <a
              href={`mailto:${tFooter('contactEmail')}`}
              className="text-amber-700 hover:text-amber-800 font-semibold"
            >
              {tFooter('contactEmail')}
            </a>
          </div>
        </div>

        {/* Back to Shop Button */}
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            {t('backToShop')}
          </Link>
        </div>
      </div>
    </div>
  );
}
