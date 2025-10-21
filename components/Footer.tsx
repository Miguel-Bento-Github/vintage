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
            <p className="text-sm">
              {t('product.authenticVintage')} {t('product.curatedWithCare').toLowerCase()}.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('nav.shop')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/shop`} className="hover:text-white">
                  {t('homepage.featured.viewAll')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?category=jacket`} className="hover:text-white">
                  {t('categories.jacket')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?category=dress`} className="hover:text-white">
                  {t('categories.dress')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?category=jeans`} className="hover:text-white">
                  {t('categories.jeans')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('nav.contact')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/contact`} className="hover:text-white">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shipping`} className="hover:text-white">
                  {t('checkout.shippingInformation')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/returns`} className="hover:text-white">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white">
                Instagram
              </a>
              <a href="#" className="hover:text-white">
                Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Dream Azul. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
