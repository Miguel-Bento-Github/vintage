# SendCloud Integration Setup Guide

This guide will help you set up SendCloud for real-time European shipping rates with support for PostNL, DHL, UPS, DPD, and other carriers.

## Why SendCloud?

**SendCloud** is the best shipping API for European e-commerce, especially for Netherlands-based stores:

- ✅ **PostNL Integration** - Netherlands' leading carrier (60% market share)
- ✅ **Multi-Carrier Support** - DHL, UPS, DPD, GLS, and 80+ carriers
- ✅ **Europe-Focused** - Optimized for EU shipping
- ✅ **Real-Time Rates** - Get actual carrier prices, not estimates
- ✅ **Automatic Fallback** - Uses static rates if API is unavailable

---

## How It Works

### With SendCloud API (Recommended)
1. Customer selects country in checkout
2. System calls SendCloud API for real-time carrier rates
3. Shows actual carrier (PostNL, DHL, etc.) with real pricing
4. Badge displays "✓ Live rate"
5. Customer sees accurate delivery time

### Without SendCloud API (Fallback)
1. Customer selects country in checkout
2. System uses static zone-based pricing
3. Shows estimated shipping cost
4. Badge displays "Estimate"
5. Works offline, no API needed

---

## Step-by-Step Setup

### 1. Create SendCloud Account

1. Go to [SendCloud.com](https://www.sendcloud.com)
2. Click **"Sign Up"** or **"Try for Free"**
3. Choose your plan:
   - **Free Plan**: 0-50 shipments/month (perfect for testing)
   - **Starter**: €25/month for 51-200 shipments
   - **Professional**: €55/month for 201-500 shipments

4. Complete registration with your business details

---

### 2. Configure Carriers in SendCloud

After signing up, you need to add shipping carriers:

1. Log in to [SendCloud Panel](https://panel.sendcloud.sc)
2. Navigate to **Settings** > **Carriers**
3. Click **"Add Carrier"**

#### Recommended Carriers for Netherlands/Europe:

**For Domestic (Netherlands):**
- **PostNL** - Best for Netherlands domestic (1-2 days, lowest cost)
  - Click "Connect PostNL"
  - Choose contract type (Business or Consumer)
  - Follow PostNL contract activation steps

**For Europe:**
- **DHL** - Fast European delivery (2-5 days)
- **DPD** - Good for Benelux + Western Europe
- **UPS** - Premium international option

**For International:**
- **DHL Express** - Worldwide shipping
- **UPS International** - Worldwide alternative

**Tip:** Start with PostNL (domestic) + DHL (international) for simplest setup.

---

### 3. Get API Credentials

1. In SendCloud Panel, go to **Settings** > **Integrations**
2. Click on **"API"** tab
3. Click **"Create API Key"**
4. You'll receive:
   - **Public Key** (starts with `public_`)
   - **Secret Key** (starts with `secret_`)

⚠️ **Important**: Save both keys securely - the secret key is only shown once!

---

### 4. Configure Environment Variables

Add your SendCloud credentials to `.env.local`:

```bash
# SendCloud API Configuration
SENDCLOUD_PUBLIC_KEY=public_your_actual_key_here
SENDCLOUD_SECRET_KEY=secret_your_actual_key_here

# Your Warehouse Address (for accurate shipping calculations)
WAREHOUSE_NAME=Your Vintage Store Name
WAREHOUSE_ADDRESS=Keizersgracht 123
WAREHOUSE_CITY=Amsterdam
WAREHOUSE_POSTAL_CODE=1015CJ
WAREHOUSE_COUNTRY=NL
```

**Update the warehouse address with your actual location!** This is used to calculate shipping distances.

---

### 5. Configure Shipping Methods in SendCloud

1. Go to **Settings** > **Shipping Methods**
2. For each carrier, create shipping methods:

#### Example: PostNL Domestic

```
Name: PostNL Standard
Carrier: PostNL
Countries: Netherlands
Min Weight: 0 kg
Max Weight: 10 kg
Price: €5.95 (or your negotiated rate)
```

#### Example: DHL Europe

```
Name: DHL Parcel Europe
Carrier: DHL
Countries: [Select all EU countries]
Min Weight: 0 kg
Max Weight: 10 kg
Price: €12.50 (or use carrier rates)
```

**Pro Tip:** Enable "Use carrier rates" if you want SendCloud to fetch real-time prices from carriers.

---

### 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to checkout and select a country
3. You should see:
   - **"Loading shipping rates..."** (while fetching)
   - Real shipping cost with carrier name
   - **"✓ Live rate"** badge (if SendCloud API works)
   - Estimated delivery time

4. Check browser console for any API errors

#### Testing Countries:
- **Netherlands (NL)**: Should show PostNL with lowest domestic rate
- **Germany (DE)**: Should show DHL or DPD European rate
- **United States (US)**: Should show DHL Express or UPS international rate

---

### 7. Verify API Calls

Check that the integration is working:

1. Open browser **DevTools** (F12)
2. Go to **Network** tab
3. Select a country in checkout
4. Look for call to `/api/shipping-quote`
5. Check the response:

**Success Response (API working):**
```json
{
  "success": true,
  "data": {
    "cost": 5.95,
    "carrier": "PostNL",
    "service": "PostNL Standard",
    "zone": "domestic",
    "estimatedDays": "1-2 business days",
    "source": "api",
    "currency": "EUR"
  }
}
```

**Fallback Response (using static rates):**
```json
{
  "success": true,
  "data": {
    "cost": 12.00,
    "carrier": "Standard",
    "service": "europe shipping",
    "zone": "europe",
    "estimatedDays": "5-7 business days",
    "source": "static",
    "currency": "USD"
  }
}
```

---

## Troubleshooting

### Problem: "Estimate" badge shown instead of "Live rate"

**Possible Causes:**
1. SendCloud API credentials not set in `.env.local`
2. Credentials are incorrect
3. No shipping methods configured in SendCloud panel
4. Selected country not supported by any shipping method

**Solution:**
- Check `.env.local` has correct `SENDCLOUD_PUBLIC_KEY` and `SENDCLOUD_SECRET_KEY`
- Verify credentials in SendCloud Panel > Settings > Integrations > API
- Check browser console for error messages
- Ensure shipping methods are configured for destination country

---

### Problem: API returns authentication error

**Error in console:**
```
SendCloud API error: 401
```

**Solution:**
- Your API credentials are invalid
- Go to SendCloud Panel > Settings > Integrations > API
- Create new API credentials
- Update `.env.local` with new keys
- Restart your dev server: `npm run dev`

---

### Problem: No shipping methods available

**Error in console:**
```
No shipping methods available for [country]
```

**Solution:**
- You haven't configured shipping methods for this country
- Go to SendCloud Panel > Settings > Shipping Methods
- Create methods for the destination country
- Ensure weight limits match typical clothing packages (0-2kg)

---

### Problem: High shipping costs

**Solution:**
SendCloud returns actual carrier rates. To reduce costs:

1. **Negotiate carrier contracts**:
   - PostNL offers business discounts
   - Contact DHL for volume discounts

2. **Use cheaper carriers**:
   - PostNL for Netherlands (cheapest domestic)
   - DPD for Europe (often cheaper than DHL)

3. **Configure shipping rules** in SendCloud:
   - Go to Settings > Shipping Rules
   - Set up rules like "If country = Germany, use DPD instead of DHL"

---

## Going to Production

Before launching with real customers:

### 1. Update to Production API Keys
```bash
# In .env.production
SENDCLOUD_PUBLIC_KEY=public_production_key
SENDCLOUD_SECRET_KEY=secret_production_key
```

### 2. Verify Carrier Contracts
- Ensure all carrier accounts are active and verified
- Check billing is set up
- Test label generation for each carrier

### 3. Set Correct Warehouse Address
Update `.env.production` with your actual warehouse/fulfillment center address.

### 4. Configure Webhooks (Optional)
SendCloud can send webhooks for tracking updates:
1. Go to Settings > Integrations > Webhooks
2. Add webhook URL: `https://yourdomain.com/api/sendcloud-webhook`
3. Select events: "Shipment status changed"

---

## Cost Breakdown

### SendCloud Pricing:
- **Free**: 0-50 shipments/month
- **Starter**: €25/month (51-200 shipments)
- **Professional**: €55/month (201-500 shipments)

### Carrier Costs (Netherlands):
- **PostNL Domestic**: ~€5.95 (0-2kg)
- **PostNL EU**: ~€12.50
- **DHL Europe**: ~€15.00
- **DHL Worldwide**: ~€25.00

**ROI**: Real-time rates reduce cart abandonment by showing accurate costs upfront. Customers appreciate transparency.

---

## Advanced Features

### 1. Service Point Delivery
SendCloud supports pickup points (PostNL Points, DHL ServicePoints):

```typescript
// Future implementation
import { getServicePoints } from '@/lib/sendcloud';

const points = await getServicePoints('NL', '1012AB');
```

### 2. Label Generation
When order is paid, create shipping label:

```typescript
const client = getSendCloudClient();
await client.createShipment(toAddress, fromAddress, parcel, shippingMethodId);
```

### 3. Tracking
SendCloud provides tracking URLs automatically.

---

## Support

- **SendCloud Support**: [help.sendcloud.com](https://support.sendcloud.com)
- **API Documentation**: [sendcloud.dev](https://www.sendcloud.dev)
- **GitHub Examples**: [github.com/SendCloud/api-integration-example](https://github.com/SendCloud/api-integration-example)

---

## Summary

✅ **Without SendCloud** (current fallback):
- Static zone-based pricing
- Shows "Estimate" badge
- Works offline
- No setup required

✅ **With SendCloud** (recommended):
- Real carrier rates (PostNL, DHL, UPS, DPD)
- Shows "✓ Live rate" badge
- Accurate delivery times
- Professional multi-carrier shipping

**Next Steps**:
1. Sign up for SendCloud free trial
2. Add PostNL + DHL carriers
3. Add API credentials to `.env.local`
4. Test checkout with different countries
5. Go live! 🚀
