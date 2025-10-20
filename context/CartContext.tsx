'use client';

import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  itemCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'vintage-store-cart';

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = useCallback((item: CartItem) => {
    // Prevent adding sold items
    if (!item.inStock) {
      console.warn('Cannot add sold item to cart:', item.productId);
      return;
    }

    setItems((prev) => {
      // Prevent duplicates - vintage items are one-of-a-kind
      const existingItem = prev.find((i) => i.productId === item.productId);
      if (existingItem) {
        console.warn('Item already in cart:', item.productId);
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.price, 0);
  }, [items]);

  const itemCount = items.length;

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    itemCount,
  }), [items, addToCart, removeFromCart, clearCart, getCartTotal, itemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
