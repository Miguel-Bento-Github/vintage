'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import QueryProvider from '@/providers/QueryProvider';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isLoginPage && !loading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [isLoginPage, user, isAdmin, loading, router]);

  // If on login page, render it without auth check (but still wrap in QueryProvider)
  if (isLoginPage) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    );
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <QueryProvider>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          </QueryProvider>
        </body>
      </html>
    );
  }

  // Don't render admin content if not authenticated
  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <div className="flex h-screen relative" style={{
            backgroundImage: `url('/patterns/flowers.png')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
            opacity: 0.97,
          }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 backdrop-blur-sm bg-white/10 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside
              className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-amber-50/80 backdrop-blur-sm shadow-sm border-r-4 border-double border-amber-800/30
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  </div>
                  {/* Close button for mobile */}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                    aria-label="Close sidebar"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-6">
                  <Link
                    href="/en"
                    onClick={() => setSidebarOpen(false)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <svg
                      className="h-5 w-5 mr-3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>View Store</span>
                    <svg
                      className="h-4 w-4 ml-auto"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>

                  <div className="px-6 py-2">
                    <div className="border-t border-gray-200"></div>
                  </div>

                  <Link
                    href="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <svg
                      className="h-5 w-5 mr-3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </Link>

                  <Link
                    href="/admin/products"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <svg
                      className="h-5 w-5 mr-3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Products
                  </Link>

                  <Link
                    href="/admin/products/edit/new"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <svg
                      className="h-5 w-5 mr-3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    Add Product
                  </Link>

                  <Link
                    href="/admin/orders"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <svg
                      className="h-5 w-5 mr-3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Orders
                  </Link>

                  <div className="mt-auto pt-6 px-6">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <svg
                        className="h-5 w-5 mr-3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile header with hamburger */}
              <header className="lg:hidden bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Open sidebar"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                  <div className="w-6" /> {/* Spacer for alignment */}
                </div>
              </header>

              {/* Main content area */}
              <main className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6 lg:p-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
