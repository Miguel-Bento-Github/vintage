'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-gray-700 hover:text-gray-900"
        aria-label="Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-xs">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      <div className="flex items-center justify-end px-4 py-4 border-b">
                        <button
                          onClick={() => setIsOpen(false)}
                          className="p-2 text-gray-900 hover:bg-gray-100 rounded-md"
                          aria-label="Close menu"
                          style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <nav className="flex flex-col py-4">
                        <Link
                          href={`/${locale}`}
                          onClick={() => setIsOpen(false)}
                          className={`px-6 py-4 ${pathname === `/${locale}` ? 'text-amber-700 bg-amber-50' : 'text-gray-900 hover:bg-gray-50'}`}
                        >
                          {t('home')}
                        </Link>
                        <Link
                          href={`/${locale}/shop`}
                          onClick={() => setIsOpen(false)}
                          className={`px-6 py-4 ${pathname === `/${locale}/shop` ? 'text-amber-700 bg-amber-50' : 'text-gray-900 hover:bg-gray-50'}`}
                        >
                          {t('shop')}
                        </Link>
                        <Link
                          href={`/${locale}/about`}
                          onClick={() => setIsOpen(false)}
                          className={`px-6 py-4 ${pathname === `/${locale}/about` ? 'text-amber-700 bg-amber-50' : 'text-gray-900 hover:bg-gray-50'}`}
                        >
                          {t('about')}
                        </Link>
                        <Link
                          href={`/${locale}/cart`}
                          onClick={() => setIsOpen(false)}
                          className={`px-6 py-4 ${pathname === `/${locale}/cart` ? 'text-amber-700 bg-amber-50' : 'text-gray-900 hover:bg-gray-50'}`}
                        >
                          {t('cart')}
                        </Link>
                      </nav>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
