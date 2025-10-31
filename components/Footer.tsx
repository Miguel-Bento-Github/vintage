'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Dream Azul</h3>
            <p className="text-sm mb-4">
              {t('product.authenticVintage')} {t('product.curatedWithCare').toLowerCase()}.
            </p>
            <p className="text-xs text-gray-400">
              Based in Utrecht, Netherlands
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('nav.shop')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/shop`} className="hover:text-white transition-colors">
                  {t('homepage.featured.viewAll')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?category=jacket`} className="hover:text-white transition-colors">
                  {t('categories.jacket')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?category=dress`} className="hover:text-white transition-colors">
                  {t('categories.dress')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?category=jeans`} className="hover:text-white transition-colors">
                  {t('categories.jeans')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/shipping`} className="hover:text-white transition-colors">
                  {t('checkout.shippingInformation')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tax-policy`} className="hover:text-white transition-colors">
                  Tax Policy
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h4 className="text-white font-semibold mb-4">Secure Shopping</h4>

            {/* Payment Methods */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-3">We Accept</p>
              <div className="flex flex-wrap gap-2 items-center">
                {/* Apple Pay */}
                <div className="bg-black rounded-md px-3 py-2 flex items-center justify-center h-10">
                  <svg className="h-5" viewBox="0 0 50 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.38 3.31c.49-.61 1.43-1.13 2.16-1.13.15 0 .31.02.44.05.12.9-.35 1.81-.86 2.38-.53.59-1.4 1.03-2.14 1.03-.14 0-.29-.02-.42-.05-.11-.87.36-1.77.82-2.28zm.81 1.16c-.25 0-.5-.07-.69-.15-.43 0-.96.29-1.21.76-.23.42-.36.97-.36 1.51 0 .78.29 1.59.82 2.17.48.53 1.16.87 1.8.87.39 0 .7-.13.98-.27.27-.13.51-.27.82-.27.28 0 .5.13.75.27.28.15.6.29 1.03.29.71 0 1.43-.43 1.91-1.07.3-.39.42-.78.52-1.04-.69-.26-1.17-1.03-1.17-1.88 0-.73.36-1.37.89-1.68-.31-.44-.78-.73-1.31-.73-.48 0-.83.13-1.11.26-.24.11-.45.22-.7.22-.27 0-.48-.11-.7-.22-.26-.13-.56-.24-.97-.24-.27 0-.58.03-.9.2zm7.79 8.41V4.37h2.65c1.46 0 2.43.99 2.43 2.48 0 1.49-.97 2.49-2.47 2.49h-1.57v3.54h-1.04zm1.04-6.42v2.74h1.41c1.06 0 1.65-.56 1.65-1.37 0-.81-.59-1.37-1.65-1.37h-1.41zm6.88 6.56c-.82 0-1.44-.38-1.81-1.05h-.03v2.99h-.98V7.81h.93v.98h.03c.38-.67.99-1.06 1.83-1.06 1.39 0 2.28 1.06 2.28 2.77 0 1.72-.89 2.78-2.25 2.78zm-.26-4.67c-.94 0-1.59.77-1.59 1.89 0 1.13.65 1.9 1.59 1.9.94 0 1.58-.78 1.58-1.9 0-1.11-.64-1.89-1.58-1.89zm7.48 4.67c-.83 0-1.45-.38-1.82-1.05h-.02v2.99h-.99V7.81h.94v.98h.02c.38-.67 1-.106 1.84-1.06 1.38 0 2.27 1.06 2.27 2.77 0 1.72-.89 2.78-2.24 2.78zm-.27-4.67c-.94 0-1.58.77-1.58 1.89 0 1.13.64 1.9 1.58 1.9.94 0 1.58-.78 1.58-1.9 0-1.11-.64-1.89-1.58-1.89zm3.36-.18h.98v5.47h-.98V7.81zm0-2.13h.98v1.24h-.98V5.68zm5.58 7.72c-1.49 0-2.46-1.02-2.46-2.77 0-1.75.97-2.78 2.46-2.78s2.46 1.03 2.46 2.78c0 1.75-.97 2.77-2.46 2.77zm0-.88c.98 0 1.46-.78 1.46-1.89 0-1.1-.48-1.89-1.46-1.89s-1.46.79-1.46 1.89c0 1.11.48 1.89 1.46 1.89z"/>
                  </svg>
                </div>

                {/* PayPal */}
                <div className="bg-blue-600 rounded-md px-3 py-2 flex items-center justify-center h-10">
                  <svg className="h-5" viewBox="0 0 50 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.76 6.4c-.2 1.27-.78 1.71-1.54 1.71h-.39l.27-1.74c.02-.1.1-.18.2-.18h.17c.43 0 .84 0 1.05.24.12.14.17.35.14.62l.1.35zm-.31-2.06h-2.6c-.17 0-.32.13-.35.3l-1.03 6.52c-.02.13.08.25.21.25h1.21c.17 0 .32-.13.35-.3l.28-1.75c.03-.17.18-.3.35-.3h.81c1.68 0 2.65-.81 2.9-2.42.11-.7 0-1.25-.35-1.64-.38-.42-1.06-.66-1.78-.66zm7.83 3.97c-.12.67-.67 1.12-1.35 1.12-.35 0-.63-.11-.81-.32-.17-.21-.24-.5-.19-.83.11-.66.67-1.13 1.34-1.13.34 0 .62.11.8.32.19.22.25.51.21.84zm1.72-1.97h-1.22c-.1 0-.19.08-.2.18l-.05.33-.09-.12c-.26-.38-.85-.51-1.44-.51-1.35 0-2.5 1.02-2.73 2.45-.12.72.05 1.4.45 1.88.38.43.92.61 1.56.61.11 0 1.11 0 1.73-.71l-.06.32c-.02.13.08.25.21.25h1.1c.17 0 .32-.13.35-.3l.66-4.14c.02-.13-.08-.24-.21-.24h-.06zM7.56 6.34H6.34c-.11 0-.21.08-.23.19l-.05.33-.09-.12c-.26-.38-.85-.51-1.44-.51C3.18 6.23 2.03 7.25 1.8 8.68c-.12.72.05 1.4.45 1.88.38.43.92.61 1.56.61.11 0 1.11 0 1.73-.71l-.06.32c-.02.13.08.25.21.25H6.8c.17 0 .32-.13.35-.3l.66-4.14c.02-.13-.08-.25-.21-.25h-.04zm-1.19 1.97c-.12.67-.67 1.12-1.35 1.12-.35 0-.63-.11-.81-.32-.17-.21-.24-.5-.19-.83.11-.66.67-1.13 1.34-1.13.34 0 .62.11.8.32.19.22.25.51.21.84zM15.76 6.34h-1.23c-.13 0-.24.06-.31.16l-1.78 2.62-.75-2.52c-.05-.15-.19-.26-.35-.26H10.1c-.14 0-.24.14-.2.27l1.42 4.16-1.34 1.89c-.09.13 0 .31.16.31h1.23c.13 0 .24-.06.31-.16l4.29-6.18c.1-.13.01-.31-.15-.31h-.06z"/>
                  </svg>
                </div>

                {/* Revolut Pay */}
                <div className="bg-black rounded-md px-3 py-2 flex items-center justify-center h-10">
                  <svg className="h-5" viewBox="0 0 60 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.94 5.67c-.92-.8-2.18-1.24-3.63-1.24H5.02c-.43 0-.78.35-.78.78v9.58c0 .43.35.78.78.78h1.4c.43 0 .78-.35.78-.78v-2.42h2.11l2.34 2.98c.15.19.38.3.62.3h1.83c.29 0 .52-.24.52-.53 0-.12-.04-.24-.11-.33l-2.59-3.31c1.25-.27 2.27-.88 3.04-1.82.76-.94 1.15-2.11 1.15-3.52 0-1.14-.37-2.14-1.17-2.94v-.01zm-3.63 5.12H8.2V6.88h2.11c1.49 0 2.42.75 2.42 1.96 0 1.2-.93 1.95-2.42 1.95z"/>
                    <text x="17" y="14" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="600" fill="white">Pay</text>
                  </svg>
                </div>

                {/* Stripe */}
                <div className="bg-[#635BFF] rounded-md px-3 py-2 flex items-center justify-center h-10">
                  <svg className="h-5" viewBox="0 0 60 25" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 01-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.87zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 01-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 01-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 00-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Buyer Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <span>Worldwide Shipping</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Dream Azul. All rights reserved.</p>
            <Link
              href="/admin"
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
              aria-label="Admin Login"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
