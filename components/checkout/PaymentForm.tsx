import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CartItem, CustomerInfo, OrderItem } from '@/types';
import { CheckoutFormData } from '@/types/checkout';

interface PaymentFormProps {
  items: CartItem[];
  formData: CheckoutFormData;
  subtotal: number;
  shipping: number;
  total: number;
  onBack: () => void;
  onClearCart: () => void;
}

export default function PaymentForm({
  items,
  formData,
  subtotal,
  shipping,
  total,
  onBack,
  onClearCart,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Submit payment to Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'Failed to submit payment details');
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation/processing`,
          payment_method_data: {
            billing_details: {
              email: formData.email,
              name: formData.name,
              address: {
                line1: formData.street,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
                country: formData.country,
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in Firebase
        const orderItems: OrderItem[] = items.map((item: CartItem) => ({
          productId: item.productId,
          title: item.title,
          brand: item.brand,
          era: item.era,
          size: item.size,
          price: item.price,
          imageUrl: item.imageUrl,
        }));

        const customerInfo: CustomerInfo = {
          email: formData.email,
          name: formData.name,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        };

        // Call API to create order
        // Note: Actual total with tax is in paymentIntent.amount
        const finalTotal = paymentIntent.amount / 100; // Convert from cents

        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            customerInfo,
            items: orderItems,
            subtotal,
            shipping,
            tax: 0, // Tax calculated by Stripe
            total: finalTotal, // Use actual charged amount from Stripe
          }),
        });

        if (!response.ok) {
          console.error('Failed to create order in database');
          // Payment succeeded but order creation failed
          // Still redirect to success page with payment intent ID
        }

        const { orderId } = await response.json();

        // Clear cart
        onClearCart();

        // Redirect to confirmation page
        router.push(`/order-confirmation/${orderId || paymentIntent.id}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
        <p className="text-gray-600">Complete your purchase securely</p>
      </div>

      {/* Order Summary (Compact) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Amount (before tax)</span>
          <span className="text-2xl font-bold text-gray-900">€{total.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {items.length} item{items.length !== 1 ? 's' : ''} • Tax/VAT calculated by Stripe
        </p>
      </div>

      {/* Stripe Payment Element */}
      <div className="border border-gray-200 rounded-lg p-6">
        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </button>
      </div>

      {/* Security Notice */}
      <p className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted. We never store your card details.
      </p>
    </form>
  );
}
