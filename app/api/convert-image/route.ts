import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let imageBuffer: Buffer;

    // Check if it's a HEIC file
    const isHeic = file.type === 'image/heic' ||
                   file.type === 'image/heif' ||
                   file.name.toLowerCase().endsWith('.heic') ||
                   file.name.toLowerCase().endsWith('.heif');

    if (isHeic) {
      // Convert HEIC to JPEG first
      const jpegBuffer = await heicConvert({
        buffer,
        format: 'JPEG',
        quality: 1, // Max quality for intermediate conversion
      });

      // Then convert to WebP with quality 85
      imageBuffer = await sharp(Buffer.from(jpegBuffer))
        .webp({ quality: 85 })
        .toBuffer();
    } else {
      // For other formats, convert directly to WebP
      imageBuffer = await sharp(buffer)
        .webp({ quality: 85 })
        .toBuffer();
    }

    // Return the converted image
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^/.]+$/, '')}.webp"`,
      },
    });
  } catch (error) {
    console.error('Image conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
