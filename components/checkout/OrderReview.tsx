import Image from 'next/image';
import { CartItem } from '@/types';
import { CheckoutFormData } from '@/types/checkout';

interface OrderReviewProps {
  items: CartItem[];
  formData: CheckoutFormData;
  subtotal: number;
  shipping: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
}

export default function OrderReview({
  items,
  formData,
  subtotal,
  shipping,
  total,
  onNext,
  onBack,
}: OrderReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Order</h2>
        <p className="text-gray-600">Please review your order before payment</p>
      </div>

      {/* Order Items */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Order Items</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4">
              <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded">
                <Image
                  src={item.imageUrl}
                  alt={`${item.brand} ${item.title}`}
                  fill
                  sizes="80px"
                  loading="eager"
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {item.brand} - {item.title}
                </h4>
                <p className="text-sm text-gray-600">Size: {item.size}</p>
                <p className="text-sm text-gray-600">{item.era}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">€{item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Shipping Address</h3>
        </div>
        <div className="p-4">
          <p className="text-gray-900 font-medium">{formData.name}</p>
          <p className="text-gray-600">{formData.email}</p>
          <p className="text-gray-600 mt-2">{formData.street}</p>
          <p className="text-gray-600">
            {formData.city}, {formData.state} {formData.postalCode}
          </p>
          <p className="text-gray-600">{formData.country}</p>
        </div>
      </div>

      {/* Order Totals */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Order Summary</h3>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `€${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax/VAT</span>
            <span className="text-sm">Calculated by Stripe</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total (before tax)</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Final total including VAT/tax will be shown at payment
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition font-medium"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
