import Link from 'next/link';
import CartIcon from './CartIcon';
import MobileMenu from './MobileMenu';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900">
            Vintage Store
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-gray-900 transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
              About
            </Link>
          </nav>

          {/* Right Side: Cart Icon and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <CartIcon />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
