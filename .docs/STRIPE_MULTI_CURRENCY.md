# Stripe Multi-Currency Payment Guide

## Overview

This application supports **6 currencies** for international payments via Stripe:
- **USD** (US Dollar) - `$`
- **EUR** (Euro) - `€`
- **GBP** (British Pound) - `£`
- **JPY** (Japanese Yen) - `¥`
- **CAD** (Canadian Dollar) - `CA$`
- **AUD** (Australian Dollar) - `A$`

Customers can shop and pay in their preferred currency, with live exchange rates automatically applied.

---

## How It Works

### 1. Currency Selection
- User selects currency via `CurrencySelector` component in header
- Currency preference is stored in localStorage
- All prices automatically convert using live exchange rates from ExchangeRate-API

### 2. Shopping Experience
- Product prices stored in **EUR** (base currency) in Firestore
- Prices displayed in user's selected currency via `<Price>` component
- Real-time conversion using cached exchange rates (1-hour cache)

### 3. Checkout Flow
1. User proceeds to checkout with items in their selected currency
2. Checkout page passes `currency` parameter to payment intent creation
3. Stripe creates PaymentIntent in the selected currency
4. Customer pays in their chosen currency

### 4. Stripe Processing
- Amount automatically converted to smallest unit (cents for most, yen for JPY)
- Stripe processes payment in customer's currency
- Settlement to your account happens in your account currency (configurable in Stripe Dashboard)

---

## Technical Implementation

### Currency Conversion for Stripe

Different currencies use different smallest units:

| Currency | Smallest Unit | Example Conversion |
|----------|--------------|-------------------|
| USD, EUR, GBP, CAD, AUD | Cents (÷100) | $10.50 → 1050 cents |
| JPY | Yen (no division) | ¥1050 → 1050 yen |

**Helper Function:**
```typescript
import { getStripeAmount } from '@/lib/stripeHelpers';

// Convert to Stripe amount
getStripeAmount(10.50, 'USD')  // Returns 1050 (cents)
getStripeAmount(1050, 'JPY')   // Returns 1050 (yen, no conversion)
```

### Payment Intent Creation

**API Endpoint:** `/api/create-payment-intent`

**Request:**
```json
{
  "items": [...],
  "currency": "USD"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "amount": 1050
}
```

**Code Example:**
```typescript
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems,
    currency: 'USD' // User's selected currency
  }),
});
```

---

## Supported Currencies

All 6 currencies are **fully supported** by Stripe and tested in this application.

### Zero-Decimal Currencies
**JPY (Japanese Yen)** is a zero-decimal currency:
- ✅ No cents/minor units
- ✅ Amounts passed to Stripe as whole numbers
- ✅ Example: ¥1,000 = 1000 (not 100000)

### Standard Currencies
**USD, EUR, GBP, CAD, AUD** use standard decimal notation:
- ✅ Amounts multiplied by 100 for Stripe
- ✅ Example: $10.50 = 1050 cents

---

## Minimum Charge Amounts

Stripe enforces minimum charge amounts per currency:

| Currency | Minimum Charge |
|----------|---------------|
| USD | $0.50 |
| EUR | €0.50 |
| GBP | £0.30 |
| JPY | ¥50 |
| CAD | CA$0.50 |
| AUD | A$0.50 |

These are handled automatically by our `getMinimumChargeAmount()` helper.

---

## Testing

### Test Mode
Stripe is configured for **test mode** by default. Use test card numbers:

**Successful Payment:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

**Requires Authentication (3D Secure):**
```
Card Number: 4000 0025 0000 3155
```

### Testing Multi-Currency

1. **Select a currency** from the header dropdown
2. **Add items to cart** - prices automatically convert
3. **Proceed to checkout** - verify correct currency in payment form
4. **Complete payment** with test card
5. **Check Stripe Dashboard** - verify payment in correct currency

### Example Test Scenarios

**Scenario 1: USD Payment**
- Select USD from currency dropdown
- Add €50 item to cart (displays as ~$58)
- Checkout → Stripe charges $58.00
- Stripe shows: `Amount: $58.00 USD`

**Scenario 2: JPY Payment**
- Select JPY from currency dropdown
- Add €50 item to cart (displays as ~¥8,779)
- Checkout → Stripe charges ¥8,779
- Stripe shows: `Amount: ¥8,779 JPY`

**Scenario 3: GBP Payment**
- Select GBP from currency dropdown
- Add €50 item to cart (displays as ~£43.50)
- Checkout → Stripe charges £43.50
- Stripe shows: `Amount: £43.50 GBP`

---

## Exchange Rates

### Live Rates
- Fetched from **ExchangeRate-API** (free, no API key)
- Cached for **1 hour** server-side
- Updated automatically
- Rounded to **2 decimal places** for clean display

### Fallback Rates
If API is unavailable, fallback rates are used:
```typescript
EUR: 1.0   (base)
USD: 1.16
GBP: 0.87
JPY: 175.58
CAD: 1.64
AUD: 1.79
```

---

## Currency Metadata

All payment intents include currency in metadata:

```typescript
metadata: {
  items: JSON.stringify(cartItems),
  subtotal: "50.00",
  shipping: "10.00",
  total: "60.00",
  currency: "USD"  // ← Currency stored for order creation
}
```

This allows order creation to know which currency was used for payment.

---

## Stripe Dashboard Configuration

### Enable Currencies
1. Log into [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Settings** → **Payment methods**
3. Under **Currencies**, ensure all 6 are enabled:
   - USD, EUR, GBP, JPY, CAD, AUD

### Settlement Currency
Your **settlement currency** (where funds land) is configured in:
- **Settings** → **Business settings** → **Currency**
- Default: Usually your account's home currency
- Stripe handles conversion automatically

### Multi-Currency Pricing
You can optionally enable **presentment currencies** in Stripe:
- **Settings** → **Customer payments** → **Presentment currencies**
- This allows Stripe to show multiple currency options at checkout
- Our implementation already handles this client-side

---

## Important Notes

### Currency vs Display
- **Prices stored:** EUR (base currency in Firestore)
- **Prices displayed:** User's selected currency (converted with live rates)
- **Prices charged:** User's selected currency (via Stripe)

### Exchange Rate Timing
- Conversion happens **before** payment intent creation
- Uses **our exchange rates**, not Stripe's
- Stripe charges the exact amount we specify in the selected currency

### Settlement
- Customer pays in their currency (e.g., USD)
- Stripe settles to your account currency (configured in dashboard)
- Stripe handles currency conversion and fees

---

## API Reference

### Helper Functions

#### `getStripeAmount(amount, currency)`
Converts amount to Stripe's smallest currency unit.

```typescript
import { getStripeAmount } from '@/lib/stripeHelpers';

getStripeAmount(10.50, 'USD') // → 1050
getStripeAmount(1050, 'JPY')  // → 1050
```

#### `getStripeCurrency(currency)`
Formats currency for Stripe (lowercase).

```typescript
import { getStripeCurrency } from '@/lib/stripeHelpers';

getStripeCurrency('USD') // → 'usd'
getStripeCurrency('EUR') // → 'eur'
```

#### `isStripeSupportedCurrency(currency)`
Validates currency support.

```typescript
import { isStripeSupportedCurrency } from '@/lib/stripeHelpers';

isStripeSupportedCurrency('USD') // → true
isStripeSupportedCurrency('XXX') // → false
```

---

## Troubleshooting

### Common Issues

**Issue:** Payment fails with "Invalid currency"
- **Solution:** Ensure currency is enabled in Stripe Dashboard
- Check: Settings → Payment methods → Currencies

**Issue:** Amount is wrong (e.g., $10 charged as $1000)
- **Solution:** Currency is likely treated as zero-decimal when it shouldn't be
- Verify `ZERO_DECIMAL_CURRENCIES` array in `stripeHelpers.ts`

**Issue:** Exchange rate seems outdated
- **Solution:** Cache may be stale (1-hour TTL)
- Check: `/api/exchange-rates` endpoint
- Force refresh: Restart dev server or wait for cache expiry

**Issue:** Customer sees wrong currency at checkout
- **Solution:** Currency selector not passing currency to payment intent
- Verify: `currency` parameter in `/api/create-payment-intent` request

---

## Production Checklist

Before going live with multi-currency payments:

- [ ] Switch Stripe to **production mode** (update `STRIPE_SECRET_KEY`)
- [ ] Enable all 6 currencies in **Stripe Dashboard**
- [ ] Configure **settlement currency** for your account
- [ ] Test each currency with real card in test mode first
- [ ] Verify **exchange rate API** is working (or use Stripe's rates)
- [ ] Set up **webhook** for payment confirmations
- [ ] Configure **tax calculation** (Stripe Tax)
- [ ] Test **3D Secure** authentication for EU cards
- [ ] Document **refund process** for each currency
- [ ] Monitor **exchange rate fluctuations** vs pricing

---

## Resources

- [Stripe Multi-Currency Docs](https://stripe.com/docs/currencies)
- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Zero-Decimal Currencies](https://stripe.com/docs/currencies#zero-decimal)
- [ExchangeRate-API](https://www.exchangerate-api.com/)

---

**Last Updated:** December 2024
**Stripe API Version:** Latest
**Supported Currencies:** 6 (USD, EUR, GBP, JPY, CAD, AUD)
