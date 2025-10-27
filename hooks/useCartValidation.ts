import { useEffect, useState } from 'react';
import { CartItem } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ValidationResult {
  validatedItems: CartItem[];
  hasUnavailableItems: boolean;
  hasDeletedItems: boolean;
  isValidating: boolean;
}

export function useCartValidation(items: CartItem[]): ValidationResult {
  const [validatedItems, setValidatedItems] = useState<CartItem[]>(items);
  const [hasUnavailableItems, setHasUnavailableItems] = useState(false);
  const [hasDeletedItems, setHasDeletedItems] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    async function validateCartItems() {
      if (items.length === 0) {
        setIsValidating(false);
        return;
      }

      setIsValidating(true);
      const validated: CartItem[] = [];
      let unavailableCount = 0;
      let deletedCount = 0;

      for (const item of items) {
        try {
          const productRef = doc(db, 'products', item.productId);
          const productSnap = await getDoc(productRef);

          if (!productSnap.exists()) {
            // Product was deleted
            deletedCount++;
            validated.push({
              ...item,
              inStock: false,
              isDeleted: true,
            });
          } else {
            const productData = productSnap.data();
            const isAvailable = productData.inStock === true;

            if (!isAvailable) {
              unavailableCount++;
            }

            validated.push({
              ...item,
              inStock: isAvailable,
              isDeleted: false,
            });
          }
        } catch (error) {
          console.error(`Error validating product ${item.productId}:`, error);
          // Keep original item if validation fails
          validated.push(item);
        }
      }

      setValidatedItems(validated);
      setHasUnavailableItems(unavailableCount > 0 || deletedCount > 0);
      setHasDeletedItems(deletedCount > 0);
      setIsValidating(false);
    }

    validateCartItems();
  }, [items]);

  return {
    validatedItems,
    hasUnavailableItems,
    hasDeletedItems,
    isValidating,
  };
}
