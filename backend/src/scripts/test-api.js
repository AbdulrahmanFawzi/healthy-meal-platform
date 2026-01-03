/**
 * ============================================
 * BACKEND API TESTING SUITE
 * ============================================
 * 
 * Purpose:
 * --------
 * Automated testing of authentication endpoints.
 * Verifies login flow, JWT generation, and error handling.
 * 
 * Prerequisites:
 * --------------
 * 1. Database seeded (npm run seed)
 * 2. Restaurant #2 seeded (npm run seed:restaurant2)
 * 3. Backend server running (npm run dev)
 * 
 * Usage:
 * ------
 * npm run test:api
 */

const jwt = require('jsonwebtoken');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_CREDENTIALS = {
  admin1: {
    phone: '+966500000001',
    password: 'Admin@123',
    expectedRole: 'admin',
    description: 'Admin #1 (Restaurant 1)'
  },
  customer1: {
    phone: '+966500000002',
    password: 'Customer@123',
    expectedRole: 'customer',
    description: 'Customer #1 (Restaurant 1)'
  },
  admin2: {
    phone: '+966500000010',
    password: 'Admin2@123',
    expectedRole: 'admin',
    description: 'Admin #2 (Restaurant 2)'
  },
  wrongPassword: {
    phone: '+966500000001',
    password: 'WrongPassword123',
    description: 'Wrong Password Test'
  },
  nonExistent: {
    phone: '+966599999999',
    password: 'test',
    description: 'Non-existent Phone Test'
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

/**
 * Make HTTP POST request
 */
async function httpPost(url, data) {
  const https = require('https');
  const http = require('http');
  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const client = isHttps ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Decode JWT and extract payload
 */
function decodeJWT(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Test login endpoint
 */
async function testLogin(testCase, credentials, expectedStatus = 200) {
  testResults.total++;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Test ${testResults.total}: ${testCase}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📞 Phone: ${credentials.phone}`);
  console.log(`🔒 Password: ${credentials.password.replace(/./g, '*')}`);
  
  try {
    const response = await httpPost(`${API_BASE_URL}/auth/login`, {
      phone: credentials.phone,
      password: credentials.password
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    // Check status code
    if (response.status !== expectedStatus) {
      console.log(`❌ FAILED: Expected ${expectedStatus}, got ${response.status}`);
      testResults.failed++;
      testResults.details.push({
        test: testCase,
        status: 'FAILED',
        reason: `Status mismatch: ${response.status} vs ${expectedStatus}`
      });
      return;
    }
    
    // For successful login (200), verify response structure
    if (expectedStatus === 200) {
      if (!response.data.success) {
        console.log(`❌ FAILED: Response success is false`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: 'Response success is false'
        });
        return;
      }
      
      const { accessToken, user, restaurant } = response.data.data;
      
      // Verify token exists
      if (!accessToken) {
        console.log(`❌ FAILED: No access token in response`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: 'Missing accessToken'
        });
        return;
      }
      
      // Decode JWT
      const payload = decodeJWT(accessToken);
      
      if (!payload) {
        console.log(`❌ FAILED: Could not decode JWT`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: 'Invalid JWT'
        });
        return;
      }
      
      console.log(`\n📦 JWT Payload:`);
      console.log(`   userId: ${payload.userId}`);
      console.log(`   role: ${payload.role}`);
      console.log(`   restaurantId: ${payload.restaurantId}`);
      console.log(`   exp: ${new Date(payload.exp * 1000).toISOString()}`);
      
      console.log(`\n👤 User Data:`);
      console.log(`   id: ${user.id}`);
      console.log(`   name: ${user.name}`);
      console.log(`   phone: ${user.phone}`);
      console.log(`   role: ${user.role}`);
      console.log(`   restaurantId: ${user.restaurantId}`);
      
      if (restaurant) {
        console.log(`\n🏪 Restaurant Data:`);
        console.log(`   id: ${restaurant.id}`);
        console.log(`   name: ${restaurant.name}`);
      }
      
      // Verify JWT payload matches user data
      if (payload.userId !== user.id) {
        console.log(`❌ FAILED: JWT userId doesn't match user.id`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: 'JWT userId mismatch'
        });
        return;
      }
      
      if (payload.role !== user.role) {
        console.log(`❌ FAILED: JWT role doesn't match user.role`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: 'JWT role mismatch'
        });
        return;
      }
      
      if (payload.restaurantId !== user.restaurantId) {
        console.log(`❌ FAILED: JWT restaurantId doesn't match user.restaurantId`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: 'JWT restaurantId mismatch'
        });
        return;
      }
      
      // Verify expected role
      if (credentials.expectedRole && user.role !== credentials.expectedRole) {
        console.log(`❌ FAILED: Expected role ${credentials.expectedRole}, got ${user.role}`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: `Role mismatch: ${user.role} vs ${credentials.expectedRole}`
        });
        return;
      }
      
      console.log(`\n✅ PASSED: All checks successful`);
      testResults.passed++;
      testResults.details.push({
        test: testCase,
        status: 'PASSED',
        userId: user.id,
        role: user.role,
        restaurantId: user.restaurantId
      });
      
    } else {
      // For error responses, verify error structure
      if (response.data.success !== false) {
        console.log(`❌ FAILED: Expected success=false for error response`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: 'Error response missing success=false'
        });
        return;
      }
      
      if (!response.data.error || !response.data.error.code) {
        console.log(`❌ FAILED: Missing error code in response`);
        testResults.failed++;
        testResults.details.push({
          test: testCase,
          status: 'FAILED',
          reason: 'Missing error code'
        });
        return;
      }
      
      console.log(`\n⚠️  Error Response:`);
      console.log(`   code: ${response.data.error.code}`);
      console.log(`   message: ${response.data.error.message}`);
      
      console.log(`\n✅ PASSED: Error handled correctly`);
      testResults.passed++;
      testResults.details.push({
        test: testCase,
        status: 'PASSED',
        errorCode: response.data.error.code
      });
    }
    
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testResults.failed++;
    testResults.details.push({
      test: testCase,
      status: 'FAILED',
      reason: error.message
    });
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 BACKEND API TESTING SUITE');
  console.log('═'.repeat(60));
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('═'.repeat(60));
  
  // Test 1: Admin #1 Login
  await testLogin(
    TEST_CREDENTIALS.admin1.description,
    TEST_CREDENTIALS.admin1,
    200
  );
  
  // Test 2: Customer #1 Login
  await testLogin(
    TEST_CREDENTIALS.customer1.description,
    TEST_CREDENTIALS.customer1,
    200
  );
  
  // Test 3: Admin #2 Login
  await testLogin(
    TEST_CREDENTIALS.admin2.description,
    TEST_CREDENTIALS.admin2,
    200
  );
  
  // Test 4: Wrong Password
  await testLogin(
    TEST_CREDENTIALS.wrongPassword.description,
    TEST_CREDENTIALS.wrongPassword,
    401
  );
  
  // Test 5: Non-existent Phone
  await testLogin(
    TEST_CREDENTIALS.nonExistent.description,
    TEST_CREDENTIALS.nonExistent,
    401
  );
  
  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log('═'.repeat(60));
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(t => t.status === 'FAILED')
      .forEach(t => {
        console.log(`   - ${t.test}: ${t.reason}`);
      });
  }
  
  if (testResults.passed === testResults.total) {
    console.log('\n🎉 ALL TESTS PASSED! Backend is ready for frontend integration.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before proceeding.');
  }
  
  console.log('\n');
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});
