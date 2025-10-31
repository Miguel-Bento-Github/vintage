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
  // CLOTHING
  {
    productType: 'Clothing',
    title: 'Classic Harris Tweed Overcoat',
    description: '<p>Exceptional 1960s Harris Tweed overcoat in gray herringbone pattern.</p><p><strong>Materials:</strong> 100% pure virgin wool sourced from the Outer Hebrides, featuring the iconic Harris Tweed orb label.</p><p><em>Condition notes:</em> Minimal wear on collar and cuffs, fully lined with burgundy silk. All original buttons intact.</p><p>The weight and construction of this piece is unmatched in modern production. A true investment piece that will last generations.</p>',
    brand: 'Harris Tweed',
    price: 285.00,
    era: '1960s',
    category: 'Coat',
    sizeLabel: 'L',
    condition: 'Excellent',
    weightGrams: 1800,
    specifications: {
      chest: 44,
      shoulders: 19,
      length: 46,
    },
    tags: ['tweed', 'wool', 'herringbone', 'formal', 'british'],
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    productType: 'Clothing',
    title: '1950s Silk Souvenir Jacket',
    description: '<p>Rare reversible silk bomber jacket from post-war Japan, circa 1955.</p><p><strong>Design:</strong> Hand-embroidered dragon motif on black silk, reversible to deep crimson. Features traditional sukajan construction with ribbed cuffs and waistband.</p><p><strong>Provenance:</strong> Originally purchased by a US serviceman stationed in Yokosuka.</p><p><em>Important note:</em> Minor thread pulls near the dragon\'s tail, otherwise exceptional condition for age. This is a museum-quality piece with incredible historical significance.</p>',
    brand: 'Unknown',
    price: 425.00,
    era: '1950s',
    category: 'Jacket',
    sizeLabel: 'M',
    condition: 'Good',
    weightGrams: 650,
    specifications: {
      chest: 40,
      shoulders: 17,
      length: 24,
    },
    tags: ['silk', 'bomber', 'souvenir', 'embroidered', 'sukajan', 'japanese'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1495105535476-b1ff03d997b9?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    productType: 'Clothing',
    title: 'Pendleton Wool Board Shirt',
    description: '<p>Classic 1960s Pendleton wool plaid board shirt in red and black buffalo check.</p><p><strong>Made in USA</strong> - Portland, Oregon facility. Features virgin wool construction, button-down collar, and signature Pendleton tag.</p><p>Perfect weight for layering or wearing as a light jacket. The pattern is timeless and the construction is superior to anything made today.</p><p><strong>Fun history:</strong> The buffalo check pattern was introduced to America in the 1850s and became synonymous with outdoor wear and rugged individualism.</p>',
    brand: 'Pendleton',
    price: 145.00,
    era: '1960s',
    category: 'Shirt',
    sizeLabel: 'M',
    condition: 'Excellent',
    weightGrams: 450,
    specifications: {
      chest: 40,
      shoulders: 18,
      length: 29,
      sleeves: 34,
    },
    tags: ['wool', 'plaid', 'flannel', 'workwear', 'americana', 'pendleton'],
    images: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
    ],
    inStock: true,
    featured: true,
  },

  // FURNITURE
  {
    productType: 'Furniture',
    title: 'Mid-Century Teak Credenza',
    description: '<p>Stunning Danish Modern teak credenza from the 1960s, likely designed by Arne Vodder for Sibast.</p><p><strong>Construction:</strong> Solid teak frame with veneered sliding doors. Interior features adjustable shelving and original brass hardware.</p><p><strong>Dimensions:</strong> Perfect for modern living spaces, offering ample storage while maintaining clean lines.</p><p><em>Condition:</em> Professionally refinished with Danish oil. Minor veneer repair on right side panel (barely visible). This piece exemplifies the golden age of Scandinavian design.</p>',
    brand: 'Sibast',
    price: 1850.00,
    era: '1960s',
    category: 'Cabinet',
    sizeLabel: 'N/A',
    condition: 'Excellent',
    weightGrams: 45000,
    specifications: {
      width: 200,
      depth: 45,
      height: 75,
    },
    conditionNotes: 'Professionally refinished. Minor veneer repair on right panel.',
    tags: ['danish-modern', 'teak', 'sideboard', 'mid-century', 'scandinavian'],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
      'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    productType: 'Furniture',
    title: 'Eames Lounge Chair & Ottoman',
    description: '<p>Iconic Herman Miller Eames Lounge Chair and Ottoman from 1978.</p><p><strong>Materials:</strong> Rosewood veneer shells with black leather upholstery. Five-star aluminum base with original rubber shock mounts.</p><p><strong>Authentication:</strong> Includes Herman Miller label and medallion. Original purchase receipt available.</p><p>This is the chair that defined luxury seating for the modern era. Charles and Ray Eames created a design so perfect it has remained in continuous production since 1956.</p><p><em>Condition notes:</em> Leather shows beautiful patina with minor creasing (expected and desirable). Rosewood has developed rich honey tones. Fully functional swivel and recline mechanism.</p>',
    brand: 'Herman Miller',
    price: 3200.00,
    era: '1970s',
    category: 'Chair',
    sizeLabel: 'Standard',
    condition: 'Excellent',
    weightGrams: 38000,
    specifications: {
      width: 83,
      depth: 85,
      height: 84,
    },
    conditionNotes: 'Beautiful leather patina, fully functional mechanisms.',
    tags: ['eames', 'herman-miller', 'lounge-chair', 'mid-century', 'iconic-design'],
    images: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800',
    ],
    inStock: true,
    featured: true,
  },

  // VINYL RECORDS
  {
    productType: 'Vinyl Records',
    title: 'Pink Floyd - The Dark Side of the Moon',
    description: '<p>Original 1973 UK pressing of Pink Floyd\'s masterpiece on Harvest Records.</p><p><strong>Catalog Number:</strong> SHVL 804. Complete with original pyramid gatefold sleeve, dual posters, and pyramid/prism sticker sheet.</p><p><strong>Grading:</strong> Vinyl VG+/EX, Sleeve VG+</p><p>This is one of the most important albums in rock history. The original UK pressings are known for their superior audio quality compared to later reissues. Features the classic "solid blue triangle" label variant.</p><p><em>Details:</em> Light surface marks that don\'t affect playback. No scratches or scuffs. Sleeve shows minor edge wear but retains vibrant colors.</p>',
    brand: 'Harvest Records',
    price: 125.00,
    era: '1970s',
    category: 'LP',
    sizeLabel: '12"',
    condition: 'Good',
    specifications: {
      format: '12" LP',
      rpm: '33⅓',
      year: 1973,
    },
    conditionNotes: 'Vinyl VG+/EX with light surface marks. Sleeve VG+ with minor edge wear.',
    tags: ['pink-floyd', 'progressive-rock', 'psychedelic', 'uk-pressing', 'harvest'],
    images: [
      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800',
      'https://images.unsplash.com/photo-1616528675140-6d2e5e72c2e8?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    productType: 'Vinyl Records',
    title: 'Miles Davis - Kind of Blue',
    description: '<p>1959 first pressing on Columbia 6-eye label (CL 1355).</p><p><strong>This is the holy grail for jazz collectors.</strong> Original mono pressing with the "6-eye" Columbia label, considered the finest sounding version ever produced.</p><p><strong>Grading:</strong> Vinyl NM-, Sleeve VG++</p><p>Kind of Blue is the best-selling jazz album of all time and arguably the most influential. This first pressing captures the warmth and presence that later stereo pressings couldn\'t match.</p><p><em>Technical notes:</em> Original owner mark on label. Surface is pristine with no audible surface noise. Plays perfectly. This is museum quality.</p>',
    brand: 'Columbia Records',
    price: 450.00,
    era: '1950s',
    category: 'LP',
    sizeLabel: '12"',
    condition: 'Excellent',
    specifications: {
      format: '12" LP Mono',
      rpm: '33⅓',
      year: 1959,
      label: 'Columbia 6-Eye',
    },
    conditionNotes: 'Near mint vinyl, VG++ sleeve. Original 6-eye label.',
    tags: ['miles-davis', 'jazz', 'modal-jazz', '6-eye', 'first-pressing'],
    images: [
      'https://images.unsplash.com/photo-1619983081563-430f63602796?w=800',
      'https://images.unsplash.com/photo-1512474932049-78ac69ede12c?w=800',
    ],
    inStock: true,
    featured: true,
  },

  // JEWELRY
  {
    productType: 'Jewelry',
    title: 'Art Deco Diamond Ring',
    description: '<p>Exquisite Art Deco platinum and diamond ring, circa 1925.</p><p><strong>Center Stone:</strong> 0.75ct Old European Cut diamond, J color, VS2 clarity</p><p><strong>Setting:</strong> Hand-engraved platinum mounting with milgrain detailing and geometric shoulder accents. Features 12 single-cut diamond accents totaling 0.15ct.</p><p><strong>Hallmarks:</strong> Platinum stamp and maker\'s mark present inside band.</p><p>This ring embodies the elegance and precision of the Art Deco era. The hand-engraving and milgrain work are exquisite and representative of the finest craftsmanship of the period.</p><p><em>Appraisal available upon request.</em></p>',
    brand: 'Unknown',
    price: 3800.00,
    era: '1920s',
    category: 'Ring',
    sizeLabel: '6.5',
    condition: 'Excellent',
    weightGrams: 3,
    specifications: {
      material: 'Platinum',
      stone: 'Diamond',
      size: '6.5',
      weight: '3.2g',
    },
    conditionNotes: 'Excellent condition. Minor wear consistent with age. Can be resized.',
    tags: ['art-deco', 'diamond', 'platinum', 'engagement', 'vintage-jewelry'],
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    productType: 'Jewelry',
    title: 'Navajo Turquoise Cuff Bracelet',
    description: '<p>Stunning sterling silver and turquoise cuff bracelet by renowned Navajo silversmith Fred Harvey, circa 1960s.</p><p><strong>Materials:</strong> Solid sterling silver with natural Sleeping Beauty turquoise cabochon</p><p><strong>Craftsmanship:</strong> Hand-stamped geometric patterns traditional to Navajo silverwork. Shadow box setting with twisted wire accents.</p><p><strong>Size:</strong> 5.75" interior circumference with 1.25" opening (adjustable)</p><p>Fred Harvey era jewelry represents some of the finest examples of Southwest Native American silverwork. This piece features the characteristic clean lines and bold turquoise that collectors prize.</p>',
    brand: 'Fred Harvey Era',
    price: 385.00,
    era: '1960s',
    category: 'Bracelet',
    sizeLabel: 'One Size',
    condition: 'Excellent',
    weightGrams: 42,
    specifications: {
      material: 'Sterling Silver',
      stone: 'Turquoise',
      weight: '42g',
    },
    tags: ['navajo', 'turquoise', 'sterling-silver', 'southwest', 'native-american'],
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800',
    ],
    inStock: true,
    featured: false,
  },

  // ELECTRONICS
  {
    productType: 'Electronics',
    title: 'Sony Walkman WM-D6C Professional',
    description: '<p>The legendary Sony WM-D6C Professional Walkman - the ultimate portable cassette recorder.</p><p><strong>Features:</strong> Dual voltage operation, Dolby B & C noise reduction, manual recording level control, mechanical tape counter, and the famous "Mega Bass" system.</p><p><strong>Condition:</strong> Fully serviced in 2024. New belts, cleaned and demagnetized heads, calibrated recording levels.</p><p>This is the unit that professional journalists and musicians relied on in the 1990s. The build quality and sound reproduction are unmatched by any portable cassette player ever made.</p><p><em>Includes:</em> Original Sony case, AC adapter, remote control, and battery pack.</p>',
    brand: 'Sony',
    price: 650.00,
    era: '1990s',
    category: 'Audio',
    sizeLabel: 'N/A',
    condition: 'Excellent',
    weightGrams: 580,
    specifications: {
      model: 'WM-D6C',
      year: '1991',
      working: 'Yes',
    },
    conditionNotes: 'Fully serviced 2024. New belts, cleaned heads. Cosmetically excellent.',
    tags: ['walkman', 'sony', 'cassette', 'professional', 'portable-audio'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800',
    ],
    inStock: true,
    featured: true,
  },
  {
    productType: 'Electronics',
    title: 'Apple iMac G3 Bondi Blue',
    description: '<p>The computer that saved Apple - the original 1998 iMac G3 in Bondi Blue.</p><p><strong>Specifications:</strong> 233MHz PowerPC G3, 32MB RAM (upgraded to 128MB), 4GB HDD, 15" CRT display, CD-ROM drive.</p><p><strong>Condition:</strong> Powers on and boots to Mac OS 8.5. All original peripherals included (keyboard, mouse, power cable). </p><p>This is the machine that defined Apple\'s design philosophy and launched the translucent plastic revolution of the late 90s. Jonathan Ive\'s breakthrough design that made computers friendly and approachable.</p><p><em>Perfect for collectors, retro gaming, or as a striking display piece.</em></p>',
    brand: 'Apple',
    price: 450.00,
    era: '1990s',
    category: 'Computer',
    sizeLabel: 'N/A',
    condition: 'Good',
    weightGrams: 15800,
    specifications: {
      model: 'iMac G3',
      year: '1998',
      working: 'Yes',
      condition: 'Powers on, fully functional',
    },
    conditionNotes: 'Minor yellowing on plastic. Screen bright and clear. Fully functional.',
    tags: ['apple', 'imac', 'g3', 'bondi-blue', 'retro-computing'],
    images: [
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800',
      'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800',
    ],
    inStock: true,
    featured: false,
  },

  // BOOKS
  {
    productType: 'Books',
    title: 'The Whole Earth Catalog - 1971',
    description: '<p>Original 1971 edition of Stewart Brand\'s revolutionary <em>Whole Earth Catalog</em>.</p><p><strong>Condition:</strong> Used but solid. Spine intact, all pages present. Some foxing and age toning throughout (expected for newsprint).</p><p>Steve Jobs called this "one of the bibles of my generation" - a pre-internet information source that democratized knowledge about tools, books, and ideas for self-sufficient living.</p><p><strong>Historical significance:</strong> This publication fundamentally influenced Silicon Valley culture and the environmental movement. Features original articles, tool reviews, and the iconic "Stay Hungry, Stay Foolish" farewell message.</p><p><em>An essential piece of counterculture history.</em></p>',
    brand: 'Portola Institute',
    price: 125.00,
    era: '1970s',
    category: 'Reference',
    sizeLabel: 'N/A',
    condition: 'Good',
    weightGrams: 900,
    specifications: {
      publisher: 'Portola Institute',
      year: '1971',
      isbn: 'N/A',
    },
    conditionNotes: 'Spine intact, all pages present. Age toning and foxing throughout.',
    tags: ['counterculture', 'reference', 'whole-earth', 'stewart-brand', 'historic'],
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    ],
    inStock: true,
    featured: true,
  },

  // ART
  {
    productType: 'Art',
    title: '1960s Abstract Expressionist Painting',
    description: '<p>Large-scale abstract expressionist oil painting by listed California artist Robert Hansen, circa 1967.</p><p><strong>Medium:</strong> Oil on canvas</p><p><strong>Dimensions:</strong> 48" x 36" (unframed)</p><p><strong>Provenance:</strong> Estate sale, San Francisco. Original gallery label verso. Signed and dated lower right.</p><p>Bold gestural brushwork in earth tones with vibrant red and yellow accents. The composition shows clear influence from the San Francisco Bay Area Figurative Movement while maintaining pure abstraction.</p><p><strong>Condition:</strong> Excellent. Original stretcher bars. Minor craquelure consistent with age. Never been restored or cleaned.</p><p><em>Certificate of authenticity available.</em></p>',
    brand: 'Robert Hansen',
    price: 2400.00,
    era: '1960s',
    category: 'Painting',
    sizeLabel: '48" x 36"',
    condition: 'Excellent',
    weightGrams: 4500,
    specifications: {
      artist: 'Robert Hansen',
      medium: 'Oil on Canvas',
      dimensions: '48 x 36 inches',
      year: '1967',
    },
    conditionNotes: 'Excellent condition. Minor craquelure. Never restored.',
    tags: ['abstract', 'expressionism', 'oil-painting', 'california-art', 'listed-artist'],
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
    ],
    inStock: true,
    featured: true,
  },

  // COLLECTIBLES
  {
    productType: 'Collectibles',
    title: 'Star Wars Action Figures - Original 1977',
    description: '<p>Complete set of the original 12 Kenner Star Wars action figures from 1977.</p><p><strong>Included:</strong> Luke Skywalker, Princess Leia, Han Solo, Chewbacca, Darth Vader, C-3PO, R2-D2, Obi-Wan Kenobi, Stormtrooper, Ben Kenobi, Death Squad Commander, and Jawa.</p><p><strong>Condition:</strong> All figures complete with original weapons and accessories. No reproductions. Joints are tight, minimal paint wear.</p><p>These are the toys that started the action figure revolution. The original 1977 series featured the revolutionary 3¾" scale that became industry standard.</p><p><strong>Authentication:</strong> All figures verified authentic with correct date stamps and copyright information. Original "Hong Kong" mold markings.</p><p><em>Figures only - no original packaging. Display case not included.</em></p>',
    brand: 'Kenner',
    price: 1850.00,
    era: '1970s',
    category: 'Toy',
    sizeLabel: '3.75"',
    condition: 'Good',
    weightGrams: 350,
    specifications: {
      manufacturer: 'Kenner',
      year: '1977',
      quantity: '12 figures',
    },
    conditionNotes: 'Complete with accessories. Tight joints, minimal paint wear. No packaging.',
    tags: ['star-wars', 'action-figures', 'kenner', '1977', 'vintage-toys'],
    images: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
      'https://images.unsplash.com/photo-1566454419290-a92111680d96?w=800',
    ],
    inStock: true,
    featured: true,
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
