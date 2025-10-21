/**
 * Seed script for populating Firestore with sample vintage products
 * Run with: npx tsx scripts/seed-products.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import * as readline from 'readline';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vintage-c534e',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vintage-c534e.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators only if enabled
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  console.log('🔧 Connecting to Firebase emulators...');
  connectFirestoreEmulator(db, 'localhost', 3476);
  connectAuthEmulator(auth, 'http://localhost:3477', { disableWarnings: true });
} else {
  console.log('🔥 Connecting to production Firebase...');
}

async function promptAdminCredentials(): Promise<{ email: string; password: string }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Admin email: ', (email) => {
      rl.question('Admin password: ', (password) => {
        rl.close();
        resolve({ email, password });
      });
    });
  });
}

const sampleProducts = [
  {
    title: 'Vintage Levi\'s 501 Jeans',
    description: 'Classic blue denim 501s from the 1980s. Worn-in perfectly with authentic fading. Button fly, straight leg cut.',
    brand: 'Levi\'s',
    price: 89.99,
    era: '1980s',
    category: 'Jeans',
    size: '32W x 30L',
    condition: 'Good',
    measurements: {
      waist: 32,
      inseam: 30,
    },
    tags: ['denim', 'jeans', 'workwear', 'american'],
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Adidas Windbreaker Jacket',
    description: 'Iconic 90s Adidas windbreaker in navy and white. Three stripes down the sleeves, full zip front.',
    brand: 'Adidas',
    price: 65.00,
    era: '1990s',
    category: 'Jacket',
    size: 'L',
    condition: 'Excellent',
    measurements: {
      chest: 44,
      length: 27,
    },
    tags: ['sportswear', 'windbreaker', 'athletic', 'trefoil'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Tommy Hilfiger Polo Shirt',
    description: 'Late 90s Tommy Hilfiger polo in forest green. Big logo on chest, classic fit.',
    brand: 'Tommy Hilfiger',
    price: 45.00,
    era: '1990s',
    category: 'Shirt',
    size: 'M',
    condition: 'Excellent',
    measurements: {
      chest: 40,
      length: 27,
    },
    tags: ['polo', 'preppy', 'logo', 'casual'],
    images: [
      'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      'https://images.unsplash.com/photo-1603251579431-8041402bdeda?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Carhartt Duck Canvas Jacket',
    description: 'Heavy duty Carhartt work jacket from the early 2000s. Brown duck canvas with corduroy collar.',
    brand: 'Carhartt',
    price: 95.00,
    era: '2000s',
    category: 'Jacket',
    size: 'L',
    condition: 'Good',
    measurements: {
      chest: 46,
      length: 28,
    },
    tags: ['workwear', 'canvas', 'rugged', 'chore'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1520367935095-76c8ed2d6f0e?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Nike Air Jordan T-Shirt',
    description: 'Classic 90s Jordan tee in black with Jumpman logo. Single stitch construction.',
    brand: 'Nike',
    price: 55.00,
    era: '1990s',
    category: 'Shirt',
    size: 'L',
    condition: 'Good',
    measurements: {
      chest: 42,
      length: 29,
    },
    tags: ['basketball', 'jordan', 'logo', 'athletic'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Wrangler Western Shirt',
    description: 'Pearl snap western shirt from the 1970s. Blue with white piping, authentic rodeo style.',
    brand: 'Wrangler',
    price: 68.00,
    era: '1970s',
    category: 'Shirt',
    size: 'M',
    condition: 'Good',
    measurements: {
      chest: 40,
      length: 28,
    },
    tags: ['western', 'pearl-snap', 'cowboy', 'rockabilly'],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      'https://images.unsplash.com/photo-1603251579431-8041402bdeda?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Champion Reverse Weave Hoodie',
    description: 'Grey Champion Reverse Weave hoodie from the 1990s. Thick heavyweight fleece, iconic construction.',
    brand: 'Champion',
    price: 110.00,
    era: '1990s',
    category: 'Shirt',
    size: 'XL',
    condition: 'Excellent',
    measurements: {
      chest: 48,
      length: 28,
    },
    tags: ['hoodie', 'sweatshirt', 'heavyweight', 'reverse-weave'],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Dickies Work Pants',
    description: 'Classic khaki Dickies work pants from the 1980s. Straight leg, reinforced knees.',
    brand: 'Dickies',
    price: 52.00,
    era: '1980s',
    category: 'Pants',
    size: '34W x 32L',
    condition: 'Good',
    measurements: {
      waist: 34,
      inseam: 32,
    },
    tags: ['workwear', 'chinos', 'durable', 'skate'],
    images: [
      'https://images.unsplash.com/photo-1624378515195-6bbdb73dff1a?w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
    ],
    inStock: false,
    featured: false,
  },
  {
    title: 'Patagonia Fleece Jacket',
    description: 'Rare 90s Patagonia Synchilla fleece in teal. Full zip, two front pockets.',
    brand: 'Patagonia',
    price: 85.00,
    era: '1990s',
    category: 'Jacket',
    size: 'M',
    condition: 'Excellent',
    measurements: {
      chest: 42,
      length: 26,
    },
    tags: ['fleece', 'outdoor', 'synchilla', 'vintage-outdoor'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Ralph Lauren Oxford Shirt',
    description: 'Classic white Oxford button-down from the 1980s. Polo logo on chest, perfect prep style.',
    brand: 'Ralph Lauren',
    price: 58.00,
    era: '1980s',
    category: 'Shirt',
    size: 'L',
    condition: 'Excellent',
    measurements: {
      chest: 44,
      length: 30,
    },
    tags: ['oxford', 'preppy', 'button-down', 'dress-shirt'],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
      'https://images.unsplash.com/photo-1603251579431-8041402bdeda?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'The North Face Puffer Vest',
    description: 'Black North Face 700-fill down vest from the early 2000s. Perfect layering piece.',
    brand: 'The North Face',
    price: 78.00,
    era: '2000s',
    category: 'Jacket',
    size: 'L',
    condition: 'Good',
    measurements: {
      chest: 44,
      length: 26,
    },
    tags: ['vest', 'puffer', 'down', 'outdoor'],
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Starter Chicago Bulls Jacket',
    description: 'Iconic Starter satin jacket from the 1990s Bulls dynasty era. Black with red trim.',
    brand: 'Starter',
    price: 145.00,
    era: '1990s',
    category: 'Jacket',
    size: 'L',
    condition: 'Good',
    measurements: {
      chest: 46,
      length: 28,
    },
    tags: ['starter', 'nba', 'bulls', 'jordan', 'satin'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1520367935095-76c8ed2d6f0e?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Pendleton Wool Plaid Shirt',
    description: 'Classic 1960s Pendleton wool plaid button-down. Red and black buffalo check pattern. Made in USA.',
    brand: 'Pendleton',
    price: 125.00,
    era: '1960s',
    category: 'Shirt',
    size: 'M',
    condition: 'Excellent',
    measurements: {
      chest: 40,
      length: 29,
    },
    tags: ['wool', 'plaid', 'flannel', 'workwear', 'americana'],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Floral Print Day Dress',
    description: 'Beautiful 1970s floral day dress with midi length. Orange and yellow print, button front.',
    brand: 'Unknown',
    price: 78.00,
    era: '1970s',
    category: 'Dress',
    size: 'S/M',
    condition: 'Good',
    measurements: {
      chest: 36,
      length: 42,
    },
    tags: ['floral', 'midi', 'boho', 'summer'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Leather Bomber Jacket',
    description: 'Heavy 1980s leather bomber jacket in brown. Quilted lining, snap front, side pockets.',
    brand: 'Wilsons Leather',
    price: 195.00,
    era: '1980s',
    category: 'Jacket',
    size: 'L',
    condition: 'Good',
    measurements: {
      chest: 46,
      length: 26,
    },
    tags: ['leather', 'bomber', 'pilot', 'motorcycle'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1520367935095-76c8ed2d6f0e?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Corduroy Bell Bottoms',
    description: 'Rare 1970s wide-wale corduroy bell bottoms in burnt orange. High waisted, authentic flare.',
    brand: 'Unknown',
    price: 88.00,
    era: '1970s',
    category: 'Pants',
    size: '28W x 32L',
    condition: 'Good',
    measurements: {
      waist: 28,
      inseam: 32,
    },
    tags: ['corduroy', 'flare', 'hippie', 'boho'],
    images: [
      'https://images.unsplash.com/photo-1624378515195-6bbdb73dff1a?w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Pendleton Wool Skirt',
    description: 'Classic 1960s Pendleton wool plaid A-line skirt. Gray and black tartan pattern.',
    brand: 'Pendleton',
    price: 72.00,
    era: '1960s',
    category: 'Skirt',
    size: 'S',
    condition: 'Excellent',
    measurements: {
      waist: 26,
      length: 24,
    },
    tags: ['wool', 'plaid', 'tartan', 'preppy'],
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Cable Knit Fisherman Sweater',
    description: 'Chunky Irish cable knit sweater from the 1980s. Cream colored, crew neck, thick wool.',
    brand: 'Aran Crafts',
    price: 95.00,
    era: '1980s',
    category: 'Sweater',
    size: 'L',
    condition: 'Excellent',
    measurements: {
      chest: 44,
      length: 28,
    },
    tags: ['cable-knit', 'wool', 'irish', 'fisherman'],
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Navy Pea Coat',
    description: 'Authentic US Navy pea coat from the 1970s. Heavy wool, anchor buttons, double breasted.',
    brand: 'US Navy',
    price: 165.00,
    era: '1970s',
    category: 'Coat',
    size: 'M',
    condition: 'Good',
    measurements: {
      chest: 42,
      length: 32,
    },
    tags: ['military', 'navy', 'wool', 'peacoat'],
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1520367935095-76c8ed2d6f0e?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Velvet Party Dress',
    description: 'Stunning 1950s black velvet cocktail dress. Fitted bodice, full skirt, back zipper.',
    brand: 'Unknown',
    price: 225.00,
    era: '1950s',
    category: 'Dress',
    size: 'XS',
    condition: 'Good',
    measurements: {
      chest: 34,
      waist: 24,
      length: 40,
    },
    tags: ['velvet', 'cocktail', 'party', 'formal', 'rockabilly'],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Vintage Levi\'s Trucker Jacket',
    description: 'Classic Type III trucker jacket from the 1970s. Light wash denim, copper buttons.',
    brand: 'Levi\'s',
    price: 135.00,
    era: '1970s',
    category: 'Jacket',
    size: 'M',
    condition: 'Good',
    measurements: {
      chest: 40,
      length: 24,
    },
    tags: ['denim', 'trucker', 'jean-jacket', 'type-iii'],
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Silk Bomber Jacket',
    description: 'Reversible silk bomber from the 1950s. Black with dragon embroidery on back. Souvenir jacket.',
    brand: 'Unknown',
    price: 385.00,
    era: '1950s',
    category: 'Jacket',
    size: 'M',
    condition: 'Fair',
    measurements: {
      chest: 40,
      length: 24,
    },
    tags: ['silk', 'bomber', 'souvenir', 'embroidered', 'sukajan'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    title: 'Fair Isle Cardigan',
    description: 'Beautiful 1960s Fair Isle pattern cardigan. Multi-color geometric design, button front.',
    brand: 'Unknown',
    price: 82.00,
    era: '1960s',
    category: 'Sweater',
    size: 'M',
    condition: 'Excellent',
    measurements: {
      chest: 38,
      length: 26,
    },
    tags: ['fair-isle', 'cardigan', 'wool', 'geometric'],
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Leather Belt with Brass Buckle',
    description: 'Handmade leather belt from the 1970s. Tooled leather with large brass buckle.',
    brand: 'Unknown',
    price: 48.00,
    era: '1970s',
    category: 'Accessories',
    size: '34',
    condition: 'Good',
    measurements: {},
    tags: ['belt', 'leather', 'brass', 'western'],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      'https://images.unsplash.com/photo-1611923134239-3f813957c7c3?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Tweed Overcoat',
    description: 'Classic 1960s Harris Tweed overcoat. Gray herringbone pattern, full length, wool lined.',
    brand: 'Harris Tweed',
    price: 275.00,
    era: '1960s',
    category: 'Coat',
    size: 'L',
    condition: 'Excellent',
    measurements: {
      chest: 44,
      length: 46,
    },
    tags: ['tweed', 'wool', 'herringbone', 'formal'],
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    ],
    inStock: true,
    featured: false,
  },
  {
    title: 'Pleated Tennis Skirt',
    description: 'White pleated tennis skirt from the 1980s. Elastic waistband, built-in shorts.',
    brand: 'Adidas',
    price: 42.00,
    era: '1980s',
    category: 'Skirt',
    size: 'S',
    condition: 'Good',
    measurements: {
      waist: 26,
      length: 14,
    },
    tags: ['tennis', 'pleated', 'athletic', 'preppy'],
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
    ],
    inStock: false,
    featured: false,
  },
];

async function seedProducts() {
  console.log('🌱 Starting product seeding...\n');

  // Authenticate as admin
  console.log('🔐 Admin authentication required');
  const { email, password } = await promptAdminCredentials();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log(`✅ Authenticated as ${email}\n`);
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    process.exit(1);
  }

  const productsRef = collection(db, 'products');
  let successCount = 0;
  let failCount = 0;

  for (const product of sampleProducts) {
    try {
      const productData = {
        ...product,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(productsRef, productData);
      console.log(`✅ Added: ${product.title} (${docRef.id})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add ${product.title}:`, error);
      failCount++;
    }
  }

  console.log(`\n📊 Seeding complete: ${successCount} success, ${failCount} failed`);
}

seedProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
