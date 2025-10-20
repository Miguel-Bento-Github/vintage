import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-6xl font-bold text-amber-700 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/shop"
            className="block w-full bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Browse Products
          </Link>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link href="/contact" className="text-amber-700 hover:text-amber-800 font-medium">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
