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
        className="md:hidden p-2 hover:text-gray-900 transition-colors"
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
            enter="ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-out duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-end max-w-full px-4 pb-4">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-out duration-150"
                  enterFrom="translate-y-full opacity-0 scale-95"
                  enterTo="translate-y-0 opacity-100 scale-100"
                  leave="transform transition ease-out duration-150"
                  leaveFrom="translate-y-0 opacity-100 scale-100"
                  leaveTo="translate-y-full opacity-0 scale-95"
                >
                  <Dialog.Panel className="pointer-events-auto w-64">
                    {/* Vintage-styled compact menu */}
                    <div className="relative bg-amber-50/80 backdrop-blur-sm rounded-t-lg shadow-2xl border-4 border-double border-amber-800/30">
                      {/* Decorative corner elements */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-800/40"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-800/40"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-800/40"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-800/40"></div>

                      {/* Close button */}
                      <div className="flex justify-end p-3 border-b border-amber-800/20">
                        <button
                          onClick={() => setIsOpen(false)}
                          className="p-1.5 text-amber-900/60 hover:text-amber-900 hover:bg-amber-100/50 rounded transition-colors"
                          aria-label="Close menu"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Navigation links */}
                      <nav className="py-3 px-4">
                        <Link
                          href={`/${locale}`}
                          onClick={() => setIsOpen(false)}
                          className={`
                            block py-3 px-4 mb-2 rounded transition-all duration-200
                            border border-transparent
                            ${pathname === `/${locale}`
                              ? 'bg-amber-800 text-amber-50 shadow-md border-amber-700'
                              : 'text-amber-900 hover:bg-amber-100/60 hover:border-amber-800/20 hover:shadow-sm'
                            }
                            font-serif text-center tracking-wide
                          `}
                        >
                          {t('home')}
                        </Link>
                        <Link
                          href={`/${locale}/shop`}
                          onClick={() => setIsOpen(false)}
                          className={`
                            block py-3 px-4 mb-2 rounded transition-all duration-200
                            border border-transparent
                            ${pathname === `/${locale}/shop`
                              ? 'bg-amber-800 text-amber-50 shadow-md border-amber-700'
                              : 'text-amber-900 hover:bg-amber-100/60 hover:border-amber-800/20 hover:shadow-sm'
                            }
                            font-serif text-center tracking-wide
                          `}
                        >
                          {t('shop')}
                        </Link>
                        <Link
                          href={`/${locale}/cart`}
                          onClick={() => setIsOpen(false)}
                          className={`
                            block py-3 px-4 rounded transition-all duration-200
                            border border-transparent
                            ${pathname === `/${locale}/cart`
                              ? 'bg-amber-800 text-amber-50 shadow-md border-amber-700'
                              : 'text-amber-900 hover:bg-amber-100/60 hover:border-amber-800/20 hover:shadow-sm'
                            }
                            font-serif text-center tracking-wide
                          `}
                        >
                          {t('cart')}
                        </Link>
                      </nav>

                      {/* Decorative bottom element */}
                      <div className="px-4 pb-3">
                        <div className="border-t border-amber-800/20 pt-2">
                          <div className="flex justify-center">
                            <svg className="w-8 h-3 text-amber-800/20" viewBox="0 0 40 12" fill="currentColor">
                              <path d="M0 6 Q10 0, 20 6 T40 6" stroke="currentColor" strokeWidth="1" fill="none"/>
                            </svg>
                          </div>
                        </div>
                      </div>
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
