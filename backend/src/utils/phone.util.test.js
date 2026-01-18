/**
 * Phone Utility Tests
 * 
 * Simple tests to verify phone normalization works correctly
 * Run with: node backend/src/utils/phone.util.test.js
 */

const { normalizePhone, isValidPhoneFormat, toLocalFormat } = require('./phone.util');

console.log('🧪 Testing Phone Utility Functions...\n');

// Test Cases
const testCases = [
  // Local format → International
  { input: '0512345678', expected: '+966512345678', description: 'Local format (05...)' },
  { input: '0598765432', expected: '+966598765432', description: 'Local format (059...)' },
  
  // International format → Keep as-is
  { input: '+966512345678', expected: '+966512345678', description: 'International format' },
  { input: '+966598765432', expected: '+966598765432', description: 'International format' },
  
  // With spaces
  { input: '05 1234 5678', expected: '+966512345678', description: 'Local with spaces' },
  { input: '+966 5 1234 5678', expected: '+966512345678', description: 'International with spaces' },
];

let passed = 0;
let failed = 0;

console.log('--- normalizePhone() Tests ---\n');

testCases.forEach(({ input, expected, description }) => {
  try {
    const result = normalizePhone(input);
    if (result === expected) {
      console.log(`✅ PASS: ${description}`);
      console.log(`   Input: "${input}" → Output: "${result}"\n`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${description}`);
      console.log(`   Input: "${input}"`);
      console.log(`   Expected: "${expected}"`);
      console.log(`   Got: "${result}"\n`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Input: "${input}"`);
    console.log(`   Error: ${error.message}\n`);
    failed++;
  }
});

// Validation tests
console.log('--- isValidPhoneFormat() Tests ---\n');

const validationTests = [
  { input: '0512345678', expected: true },
  { input: '+966512345678', expected: true },
  { input: '1234567890', expected: false },
  { input: '+1234567890', expected: false },
  { input: '05123', expected: false },
];

validationTests.forEach(({ input, expected }) => {
  const result = isValidPhoneFormat(input);
  if (result === expected) {
    console.log(`✅ PASS: "${input}" → ${result}`);
    passed++;
  } else {
    console.log(`❌ FAIL: "${input}" → Expected: ${expected}, Got: ${result}`);
    failed++;
  }
});

// toLocalFormat tests
console.log('\n--- toLocalFormat() Tests ---\n');

const localFormatTests = [
  { input: '+966512345678', expected: '0512345678' },
  { input: '0512345678', expected: '0512345678' },
];

localFormatTests.forEach(({ input, expected }) => {
  const result = toLocalFormat(input);
  if (result === expected) {
    console.log(`✅ PASS: "${input}" → "${result}"`);
    passed++;
  } else {
    console.log(`❌ FAIL: "${input}" → Expected: "${expected}", Got: "${result}"`);
    failed++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
