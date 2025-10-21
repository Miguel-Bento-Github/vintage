import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Automatically detect locale from Accept-Language header
  localeDetection: true,

  // Prefix for locale in URL (always show locale in URL)
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - static files
  // - admin routes (not localized)
  matcher: ['/((?!api|_next|admin|.*\\..*).*)']
};
