'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    brand: string;
    era: string;
    category: string;
    size: string;
    price: number;
    imageUrl: string;
    inStock: boolean;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, items } = useCart();
  const [showAdded, setShowAdded] = useState(false);

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

    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 2000);
  };

  if (!product.inStock) {
    return (
      <button
        disabled
        className="w-full py-4 px-6 bg-gray-300 text-gray-500 rounded-lg font-semibold text-lg cursor-not-allowed"
      >
        Sold Out
      </button>
    );
  }

  if (isInCart) {
    return (
      <button
        disabled
        className="w-full py-4 px-6 bg-gray-600 text-white rounded-lg font-semibold text-lg cursor-not-allowed"
      >
        Already in Cart
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
        showAdded
          ? 'bg-green-600 text-white'
          : 'bg-amber-700 text-white hover:bg-amber-800'
      }`}
    >
      {showAdded ? '✓ Added to Cart' : 'Add to Cart'}
    </button>
  );
}
