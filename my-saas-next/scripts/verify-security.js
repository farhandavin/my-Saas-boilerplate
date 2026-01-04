const fetch = require('node-fetch');

async function verifySecurity() {
  const BASE_URL = 'http://localhost:3000';
  console.log(`Starting Security Verification against ${BASE_URL}...`);

  try {
    // 1. Test CSRF Token Endpoint
    console.log('\n[1] Testing /api/csrf...');
    const csrfRes = await fetch(`${BASE_URL}/api/csrf`);
    if (csrfRes.ok) {
      const data = await csrfRes.json();
      if (data.csrfToken) {
        console.log('✅ PASS: CSRF Endpoint returned token:', data.csrfToken.substring(0, 10) + '...');
      } else {
        console.error('❌ FAIL: CSRF Endpoint returned 200 but missing token');
      }
    } else {
      // If 404, maybe server not running or route missing
      console.warn(`⚠️ WARN: /api/csrf returned ${csrfRes.status}. Server might be down or route missing.`);
    }

    // 2. Test Protected Endpoint (Billing Portal) WITHOUT Token
    console.log('\n[2] Testing Protected Route (No Token)...');
    const protectedRes = await fetch(`${BASE_URL}/api/billing/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnUrl: '/' })
    });

    console.log(`Status: ${protectedRes.status}`);
    if (protectedRes.status === 401 || protectedRes.status === 403) {
      console.log('✅ PASS: Request correctly rejected (401/403)');
    } else if (protectedRes.status === 200) {
      console.error('❌ FAIL: Request succeeded without Auth/CSRF! Security hole.');
    } else {
      console.log(`ℹ️ NOTE: Received ${protectedRes.status} (likely Auth redirect or error)`);
    }

  } catch (error) {
    console.error('🚨 Error running verification:', error.message);
    console.log('Ensure the server is running on http://localhost:3000');
  }
}

// Run if main
verifySecurity();
