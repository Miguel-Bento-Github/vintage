'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import CartIcon from './CartIcon';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySelector from './CurrencySelector';

export default function Header() {
  const locale = useLocale();
  const t = useTranslations('nav');

  return (
    <header className="border-b-4 border-double border-amber-800/30 bg-amber-50/80 sticky top-0 z-40 backdrop-blur-sm shadow-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Dream Azul"
              width={48}
              height={48}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 ml-8">
            <Link href={`/${locale}`} className="hover:text-gray-900 transition-colors">
              {t('home')}
            </Link>
            <Link href={`/${locale}/shop`} className="hover:text-gray-900 transition-colors">
              {t('shop')}
            </Link>
          </nav>

          {/* Right Side: Currency Selector, Language Switcher, Cart Icon and Mobile Menu */}
          <div className="flex items-center space-x-2 ml-auto">
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
