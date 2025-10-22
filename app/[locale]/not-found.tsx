import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function LocaleNotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-amber-700 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('description')}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
          >
            {t('goHome')}
          </Link>
          <Link
            href="/shop"
            className="block w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {t('browseProducts')}
          </Link>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            {t('needHelp')}{' '}
            <a href="mailto:support@dreamazul.com" className="text-amber-700 hover:text-amber-800 font-medium">
              {t('contactUs')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
