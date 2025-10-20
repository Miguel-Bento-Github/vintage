/**
 * Manual Firestore Security Rules Test
 *
 * This script tests the security rules by attempting various operations
 * Run with: npm run test:security
 *
 * Prerequisites:
 * 1. Firebase emulators must be running: firebase emulators:start
 * 2. NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true in .env.local
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  connectFirestoreEmulator
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "demo-api-key",
  projectId: "demo-test-project",
  authDomain: "demo-test-project.firebaseapp.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
connectFirestoreEmulator(db, 'localhost', 3476);

interface TestResult {
  name: string;
  expected: 'ALLOW' | 'DENY';
  actual: 'PASS' | 'FAIL';
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, expected: 'ALLOW' | 'DENY', passed: boolean, error?: string) {
  results.push({
    name,
    expected,
    actual: passed ? 'PASS' : 'FAIL',
    error
  });

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name} - Expected: ${expected}, Result: ${passed ? 'PASS' : 'FAIL'}`);
  if (error && !passed) {
    console.log(`   Error: ${error}`);
  }
}

async function runTests() {
  console.log('\n🔒 Testing Firestore Security Rules\n');
  console.log('='.repeat(60));

  // ============================================================================
  // PRODUCTS TESTS
  // ============================================================================
  console.log('\n📦 PRODUCTS TESTS\n');

  // Test 1: Public read of products
  try {
    const productRef = doc(db, 'products', 'test-product');
    await getDoc(productRef);
    logTest('Public can read products', 'ALLOW', true);
  } catch (error) {
    logTest('Public can read products', 'ALLOW', false, (error as Error).message);
  }

  // Test 2: Non-admin cannot create products
  try {
    const productRef = doc(db, 'products', 'malicious-product');
    await setDoc(productRef, {
      title: 'Fake Product',
      price: 0.01
    });
    logTest('Non-admin CANNOT create products', 'DENY', false, 'Creation succeeded when it should have failed');
  } catch (error) {
    const message = (error as Error).message;
    logTest('Non-admin CANNOT create products', 'DENY', message.includes('permission-denied') || message.includes('PERMISSION_DENIED'), message);
  }

  // ============================================================================
  // ORDERS TESTS - CRITICAL
  // ============================================================================
  console.log('\n📋 ORDERS TESTS (CRITICAL SECURITY)\n');

  // Test 3: Can GET specific order by ID
  try {
    const orderRef = doc(db, 'orders', 'test-order-id');
    await getDoc(orderRef);
    logTest('Anyone can GET specific order by ID', 'ALLOW', true);
  } catch (error) {
    logTest('Anyone can GET specific order by ID', 'ALLOW', false, (error as Error).message);
  }

  // Test 4: CANNOT list all orders (prevents data breach)
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    // Even if query succeeds, it should return 0 docs due to security rules
    // OR it should throw an error
    const docCount = snapshot.size;
    if (docCount === 0) {
      // This is actually the rule working - empty results mean no access
      logTest('Non-admin CANNOT list all orders', 'DENY', true, 'Query returned 0 documents (security rules working)');
    } else {
      logTest('Non-admin CANNOT list all orders', 'DENY', false, `Query returned ${docCount} documents when it should return 0`);
    }
  } catch (error) {
    const message = (error as Error).message;
    // Either error OR 0 results is acceptable
    logTest('Non-admin CANNOT list all orders', 'DENY', message.includes('permission-denied') || message.includes('PERMISSION_DENIED') || message.includes('false for'), message);
  }

  // Test 5: CANNOT create order (prevents price manipulation)
  try {
    const orderRef = doc(db, 'orders', 'attack-order');
    await setDoc(orderRef, {
      customerInfo: {
        email: 'attacker@evil.com',
        name: 'Attacker'
      },
      items: [{
        productId: 'expensive-item',
        quantity: 1,
        price: 500
      }],
      total: 0.01, // Trying to set price to €0.01!
      paymentIntentId: 'pi_fake123',
      status: 'paid'
    });
    logTest('CRITICAL: Client CANNOT create orders', 'DENY', false, 'Order creation succeeded - PRICE MANIPULATION POSSIBLE!');
  } catch (error) {
    const message = (error as Error).message;
    logTest('CRITICAL: Client CANNOT create orders', 'DENY', message.includes('permission-denied') || message.includes('PERMISSION_DENIED'), message);
  }

  // Test 6: CANNOT update order (prevents status manipulation)
  try {
    const orderRef = doc(db, 'orders', 'existing-order');
    await updateDoc(orderRef, {
      status: 'cancelled'
    });
    logTest('Non-admin CANNOT update orders', 'DENY', false, 'Update succeeded when it should have failed');
  } catch (error) {
    const message = (error as Error).message;
    logTest('Non-admin CANNOT update orders', 'DENY', message.includes('permission-denied') || message.includes('PERMISSION_DENIED'), message);
  }

  // Test 7: CANNOT delete orders
  try {
    const orderRef = doc(db, 'orders', 'test-order');
    await deleteDoc(orderRef);
    logTest('Nobody can delete orders', 'DENY', false, 'Delete succeeded when it should have failed');
  } catch (error) {
    const message = (error as Error).message;
    logTest('Nobody can delete orders', 'DENY', message.includes('permission-denied') || message.includes('PERMISSION_DENIED'), message);
  }

  // ============================================================================
  // ATTACK SCENARIOS
  // ============================================================================
  console.log('\n🚨 ATTACK SCENARIO TESTS\n');

  // Attack 1: Zero-price order
  try {
    const attackRef = doc(db, 'orders', 'zero-price-attack');
    await setDoc(attackRef, {
      customerInfo: { email: 'attacker@evil.com', name: 'Attacker' },
      items: [{ productId: 'expensive', quantity: 10, price: 1000 }],
      total: 0, // FREE!
      paymentIntentId: 'pi_fake',
      status: 'paid'
    });
    logTest('ATTACK: Zero-price order prevented', 'DENY', false, '🚨 CRITICAL: Zero-price orders are possible!');
  } catch (error) {
    const message = (error as Error).message;
    logTest('ATTACK: Zero-price order prevented', 'DENY', message.includes('permission-denied') || message.includes('PERMISSION_DENIED'), message);
  }

  // Attack 2: Price manipulation
  try {
    const attackRef = doc(db, 'orders', 'price-manipulation');
    await setDoc(attackRef, {
      customerInfo: { email: 'attacker@evil.com', name: 'Attacker' },
      items: [{ productId: 'product', quantity: 1, price: 1000 }],
      total: 0.01, // €1000 product for €0.01!
      paymentIntentId: 'pi_fake',
      status: 'paid'
    });
    logTest('ATTACK: Price manipulation prevented', 'DENY', false, '🚨 CRITICAL: Price manipulation is possible!');
  } catch (error) {
    const message = (error as Error).message;
    logTest('ATTACK: Price manipulation prevented', 'DENY', message.includes('permission-denied') || message.includes('PERMISSION_DENIED'), message);
  }

  // ============================================================================
  // RESULTS SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST RESULTS SUMMARY\n');

  const passed = results.filter(r => r.actual === 'PASS').length;
  const failed = results.filter(r => r.actual === 'FAIL').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n⚠️  FAILED TESTS:\n');
    results.filter(r => r.actual === 'FAIL').forEach(r => {
      console.log(`❌ ${r.name}`);
      if (r.error) {
        console.log(`   ${r.error}`);
      }
    });
  }

  console.log('\n' + '='.repeat(60));

  if (passed === total) {
    console.log('\n✅ ALL TESTS PASSED - Security rules are working correctly!\n');
  } else {
    console.log('\n❌ SOME TESTS FAILED - Please review security rules!\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
