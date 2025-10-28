# Product Translation Setup Guide

This guide explains how to enable automatic product translations in your vintage store.

## Overview

The translation system supports a **hybrid approach**:
- ✅ Manual translations (always available)
- ✅ Automatic AI translations (requires API setup)

## Quick Start - Manual Translation

Manual translation is **already working** - no setup required!

1. Go to Admin → Add Product or Edit Product
2. Scroll to "Product Translations" section
3. Select a language (Spanish, French, German, Japanese)
4. Enter translations manually
5. Save your product

## Enable Auto-Translation

To use the "Translate Now" button for automatic translations, choose one of these services:

### Option 1: DeepL (Recommended - Best Quality)

1. Sign up at https://www.deepl.com/pro-api
2. Get your API key
3. Add to `.env.local`:
```bash
DEEPL_API_KEY=your_deepl_api_key_here
```
4. Restart your dev server

**Pricing:** Free tier includes 500,000 characters/month

### Option 2: OpenAI (Context-Aware)

1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env.local`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```
3. Restart your dev server

**Pricing:** ~$0.002 per 1K tokens (approx $2 per 1M characters)

## Using Auto-Translation

Once you've added an API key:

1. Fill in English title, description, and condition notes
2. Go to Product Translations section
3. Select target language (Spanish, French, etc.)
4. Click **"Translate Now"** button
5. Wait a few seconds for AI translation
6. Review and edit the translation if needed
7. Save your product

## Translation Priority

The system tries translation services in this order:
1. DeepL (if configured) - Best quality
2. OpenAI (if configured) - Context-aware fallback

You can configure both services for automatic fallback.

## Features

### Automatic Fallback
If a translation doesn't exist, the system automatically shows the English version.

### SEO Benefits
- Each language gets its own localized metadata
- Better search rankings in different countries
- Improved user experience

### Translation Status
Visual indicators show translation completeness:
- ✅ Green = Fully translated
- 🟡 Yellow = Partially translated
- ⚪ Gray = Not translated

## Example `.env.local` File

```bash
# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...

# Translation (add one or both)
DEEPL_API_KEY=your_deepl_key_here
OPENAI_API_KEY=your_openai_key_here

# Admin
ADMIN_EMAIL=your-admin@email.com
```

## Troubleshooting

### "Translation failed" error
- Check that your API key is correctly set in `.env.local`
- Restart your development server after adding keys
- Verify your API account has remaining credits

### Translations not appearing
- Make sure you saved the product after translating
- Clear browser cache and reload
- Check browser console for errors

### Poor translation quality
- Try DeepL for best quality
- For vintage fashion terms, OpenAI may be more context-aware
- Always review and edit automated translations

## Supported Languages

- 🇬🇧 English (base language)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇯🇵 Japanese

## Cost Estimation

For a store with 100 products, assuming each has ~500 characters of content to translate:

- **DeepL**: ~50,000 chars = **FREE** (under free tier limit)
- **OpenAI**: ~50,000 chars = **~$0.10**

Translations are one-time - once saved to database, they don't consume additional API calls.

**Recommendation:** Use DeepL for best quality and free pricing. OpenAI automatically serves as fallback if DeepL quota is exceeded.

## Need Help?

- Check the browser console for detailed error messages
- Verify API keys are correct
- Make sure `.env.local` is not committed to git
- Contact support with error messages if issues persist
