const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const svgPath = path.join(publicDir, 'logo.svg');

// Read SVG and add background
const svgBuffer = fs.readFileSync(svgPath);
const svgString = svgBuffer.toString();

// Add background to SVG if not present
const svgWithBg = svgString.replace(
  '<svg',
  '<svg style="background-color: #d4c5b0"'
);

async function convertLogo() {
  console.log('Converting logo to various formats...');

  // Convert to PNG first (sharp handles PNG from SVG better)
  await sharp(Buffer.from(svgWithBg))
    .resize(512, 512)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-512.png'));
  console.log('✓ Created logo-512.png');

  // Create JPG from PNG
  await sharp(path.join(publicDir, 'logo-512.png'))
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(path.join(publicDir, 'logo.jpg'));
  console.log('✓ Created logo.jpg');

  // Create WebP from PNG
  await sharp(path.join(publicDir, 'logo-512.png'))
    .webp({ quality: 85 })
    .toFile(path.join(publicDir, 'logo.webp'));
  console.log('✓ Created logo.webp');

  // Create various favicon sizes
  const sizes = [16, 32, 48, 64, 128, 192, 256, 512];

  for (const size of sizes) {
    await sharp(Buffer.from(svgWithBg))
      .resize(size, size)
      .png({ quality: 90 })
      .toFile(path.join(publicDir, `favicon-${size}x${size}.png`));
    console.log(`✓ Created favicon-${size}x${size}.png`);
  }

  // Create apple-touch-icon
  await sharp(Buffer.from(svgWithBg))
    .resize(180, 180)
    .png({ quality: 90 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  console.log('\n✅ All logo conversions complete!');
}

convertLogo().catch(console.error);
