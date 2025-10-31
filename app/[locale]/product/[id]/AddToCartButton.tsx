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
    });

    // Track analytics with effective price
    trackAddToCart(product.id, product.title, effectivePrice, product.brand);

    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  if (!product.inStock) {
    return (
      <VintageButton
        type="button"
        disabled
        variant="disabled"
      >
        {t('soldOut')}
      </VintageButton>
    );
  }

  if (isInCart) {
    return (
      <VintageButton
        type="button"
        disabled
        variant="disabled"
      >
        {t('alreadyInCart')}
      </VintageButton>
    );
  }

  return (
    <VintageButton
      type="button"
      onClick={handleAddToCart}
      variant={showAdded ? 'success' : 'primary'}
    >
      {showAdded ? `✓ ${t('addedToCart')}` : t('addToCart')}
    </VintageButton>
  );
}
