import { NextRequest, NextResponse } from 'next/server';
import { translateProductFields } from '@/lib/autoTranslate';
import type { Locale } from '@/i18n';
import { locales } from '@/i18n';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, conditionNotes, targetLang } = body;

    // Validate target language
    if (!targetLang || !locales.includes(targetLang as Locale)) {
      return NextResponse.json(
        { error: 'Invalid target language' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Perform translation
    const result = await translateProductFields(
      title,
      description,
      conditionNotes,
      targetLang as Locale
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'Translation failed', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      translation: {
        title: result.title,
        description: result.description,
        conditionNotes: result.conditionNotes,
      },
    });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
