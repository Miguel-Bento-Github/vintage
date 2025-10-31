'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

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
              <div className="flex flex-wrap gap-3 items-center">
                {/* Credit Cards */}
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/Visa.svg" alt="Visa" fill className="object-contain" />
                </div>
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/Mastercard.svg" alt="Mastercard" fill className="object-contain" />
                </div>
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/Amex.svg" alt="Amex" fill className="object-contain" />
                </div>

                {/* Digital Wallets */}
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/ApplePay.svg" alt="Apple Pay" fill className="object-contain" />
                </div>
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/GooglePay.svg" alt="Google Pay" fill className="object-contain" />
                </div>
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/PayPal.svg" alt="PayPal" fill className="object-contain" />
                </div>
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/AmazonPay.svg" alt="Amazon Pay" fill className="object-contain" />
                </div>

                {/* European Bank Methods */}
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/Ideal.svg" alt="iDEAL" fill className="object-contain" />
                </div>
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/Bancontact.svg" alt="Bancontact" fill className="object-contain" />
                </div>

                {/* Buy Now Pay Later */}
                <div className="w-[50px] h-[32px] relative">
                  <Image src="/payment-icons/Klarna.svg" alt="Klarna" fill className="object-contain" />
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
