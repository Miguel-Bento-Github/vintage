'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Era, Category } from '@/types';
import { trackAddToCart } from '@/services/analyticsService';
import { useTranslations } from '@/hooks/useTranslations';
import { getEffectivePrice } from '@/lib/discount';
import VintageButton from '@/components/VintageButton';

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    brand: string;
    era: Era;
    category: Category;
    size: string;
    price: number;
    imageUrl: string;
    inStock: boolean;
    weightGrams?: number;
    freeShipping?: boolean;
    discountPrice?: number;
    discountStartDate?: string;
    discountEndDate?: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, items } = useCart();
  const [showAdded, setShowAdded] = useState(false);
  const t = useTranslations('product');

  const isInCart = items.some((item) => item.productId === product.id);

  const handleAddToCart = () => {
    if (isInCart) {
      return; // Already in cart
    }

    // Use effective price (discounted if active, otherwise regular)
    const effectivePrice = getEffectivePrice(product);

    addToCart({
      productId: product.id,
      title: product.title,
      brand: product.brand,
      era: product.era,
      category: product.category,
      size: product.size,
      price: effectivePrice, // Use discounted price if active
      imageUrl: product.imageUrl,
      inStock: product.inStock,
      weightGrams: product.weightGrams,
      freeShipping: product.freeShipping,
    });

    // Track analytics with effective price
    trackAddToCart(product.id, product.title, effectivePrice, product.brand);

    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  if (!product.inStock) {
    return (
      <>
        <VintageButton
          type="button"
          disabled
          variant="disabled"
        >
          {t('soldOut')}
        </VintageButton>
        {/* Mobile floating cart button - disabled */}
        <div className="md:hidden fixed bottom-0 right-0 left-0 pointer-events-none z-50">
          <div className="relative h-0">
            <button
              type="button"
              disabled
              className="absolute bottom-6 right-6 pointer-events-auto w-16 h-16 bg-gradient-to-b from-gray-300 to-gray-400 text-gray-600 border-4 border-gray-500 rounded-full shadow-[0_4px_0_0_rgba(107,114,128,0.3),inset_0_2px_0_0_rgba(255,255,255,0.2)] flex items-center justify-center cursor-not-allowed"
              aria-label={t('soldOut')}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isInCart) {
    return (
      <>
        <VintageButton
          type="button"
          disabled
          variant="disabled"
        >
          {t('alreadyInCart')}
        </VintageButton>
        {/* Mobile floating cart button - already in cart */}
        <div className="md:hidden fixed bottom-0 right-0 left-0 pointer-events-none z-50">
          <div className="relative h-0">
            <button
              type="button"
              disabled
              className="absolute bottom-6 right-6 pointer-events-auto w-16 h-16 bg-gradient-to-b from-gray-300 to-gray-400 text-gray-600 border-4 border-gray-500 rounded-full shadow-[0_4px_0_0_rgba(107,114,128,0.3),inset_0_2px_0_0_rgba(255,255,255,0.2)] flex items-center justify-center cursor-not-allowed"
              aria-label={t('alreadyInCart')}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <VintageButton
        type="button"
        onClick={handleAddToCart}
        variant={showAdded ? 'success' : 'primary'}
      >
        {showAdded ? `✓ ${t('addedToCart')}` : t('addToCart')}
      </VintageButton>
      {/* Mobile floating cart button - active */}
      <div className="md:hidden fixed bottom-0 right-0 left-0 pointer-events-none z-50">
        <div className="relative h-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`absolute bottom-6 right-6 pointer-events-auto w-16 h-16 border-4 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
              showAdded
                ? 'bg-green-600 text-white border-green-900 shadow-[0_4px_0_0_rgba(20,83,45,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] active:shadow-[0_2px_0_0_rgba(20,83,45,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] active:translate-y-[2px]'
                : 'bg-gradient-to-b from-amber-600 to-amber-800 text-white border-amber-900 shadow-[0_4px_0_0_rgba(120,53,15,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] active:shadow-[0_2px_0_0_rgba(120,53,15,0.4),inset_0_2px_0_0_rgba(255,255,255,0.2)] active:translate-y-[2px]'
            }`}
            aria-label={showAdded ? t('addedToCart') : t('addToCart')}
          >
            {showAdded ? (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
