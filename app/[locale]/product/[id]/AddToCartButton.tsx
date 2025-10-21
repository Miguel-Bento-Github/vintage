'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Era, Category } from '@/types';
import { trackAddToCart } from '@/services/analyticsService';
import { useTranslations } from '@/hooks/useTranslations';

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

    addToCart({
      productId: product.id,
      title: product.title,
      brand: product.brand,
      era: product.era,
      category: product.category,
      size: product.size,
      price: product.price,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
    });

    // Track analytics
    trackAddToCart(product.id, product.title, product.price, product.brand);

    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  if (!product.inStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-4 px-6 bg-gray-300 text-gray-500 rounded-lg font-semibold text-lg cursor-not-allowed"
      >
        {t('soldOut')}
      </button>
    );
  }

  if (isInCart) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-4 px-6 bg-gray-600 text-white rounded-lg font-semibold text-lg cursor-not-allowed"
      >
        {t('alreadyInCart')}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
        showAdded
          ? 'bg-green-600 text-white'
          : 'bg-amber-700 text-white hover:bg-amber-800'
      }`}
    >
      {showAdded ? `✓ ${t('addedToCart')}` : t('addToCart')}
    </button>
  );
}
