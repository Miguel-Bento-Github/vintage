import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function TaxPolicyPage() {
  const t = useTranslations('taxPolicy');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
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
              <p className="text-sm text-yellow-700">
                <strong className="font-semibold">{t('disclaimerTitle')}</strong>{' '}
                {t('disclaimer')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
          {/* Overview Section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('overviewTitle')}</h2>
            <p className="text-gray-700 mb-4">{t('overviewIntro')}</p>
            <p className="text-gray-700">{t('overviewExplanation')}</p>
          </div>

          {/* Current Policy Section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('currentPolicyTitle')}</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-900 font-semibold text-lg">{t('currentPolicyHighlight')}</p>
            </div>
            <p className="text-gray-700 mb-4">{t('currentPolicyRationale')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t('rationalePoint1')}</li>
              <li>{t('rationalePoint2')}</li>
              <li>{t('rationalePoint3')}</li>
              <li>{t('rationalePoint4')}</li>
            </ul>
          </div>

          {/* Customer Responsibilities */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('customerResponsibilitiesTitle')}</h2>
            <p className="text-gray-700 mb-4">{t('customerResponsibilitiesIntro')}</p>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('useTaxTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('useTaxDescription')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('importDutiesTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('importDutiesDescription')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('recordKeepingTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('recordKeepingDescription')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('professionalAdviceTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('professionalAdviceDescription')}</p>
              </div>
            </div>
          </div>

          {/* Regional Information */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('regionalInfoTitle')}</h2>
            <p className="text-gray-700 mb-4">{t('regionalInfoIntro')}</p>

            <div className="space-y-4">
              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('usTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('usDescription')}</p>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('euTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('euDescription')}</p>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('ukTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('ukDescription')}</p>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('canadaTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('canadaDescription')}</p>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('australiaTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('australiaDescription')}</p>
              </div>

              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('japanTitle')}</h3>
                <p className="text-gray-700 text-sm">{t('japanDescription')}</p>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('questionsTitle')}</h2>
            <p className="text-gray-700 mb-4">{t('questionsIntro')}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>{t('questionItem1')}</li>
              <li>{t('questionItem2')}</li>
              <li>{t('questionItem3')}</li>
              <li>{t('questionItem4')}</li>
            </ul>
          </div>

          {/* Documentation Reference */}
          <div className="p-6 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('documentationTitle')}</h2>
            <p className="text-gray-700 mb-4">{t('documentationDescription')}</p>
            <a
              href="/docs/tax-policy.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <svg
                className="mr-2 h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t('viewFullDocumentation')}
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

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-gray-500">
          {t('lastUpdated')}: {t('updateDate')}
        </div>
      </div>
    </div>
  );
}
