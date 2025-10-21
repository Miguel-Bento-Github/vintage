'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import CartIcon from './CartIcon';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySelector from './CurrencySelector';

export default function Header() {
  const locale = useLocale();
  const t = useTranslations('nav');

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="text-xl sm:text-2xl font-bold text-gray-900">
            Vintage Store
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href={`/${locale}`} className="text-gray-700 hover:text-gray-900 transition-colors">
              {t('home')}
            </Link>
            <Link href={`/${locale}/shop`} className="text-gray-700 hover:text-gray-900 transition-colors">
              {t('shop')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-700 hover:text-gray-900 transition-colors">
              {t('about')}
            </Link>
          </nav>

          {/* Right Side: Currency Selector, Language Switcher, Cart Icon and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <CurrencySelector />
            <LanguageSwitcher />
            <CartIcon />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
