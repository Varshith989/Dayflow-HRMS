const mongoose = require('mongoose');
const request = require('http');

async function runPhase2Test() {
  console.log('🧪 Starting Phase 2 Authentication & JWT Authorization Tests...');

  // Start the server
  const app = require('./server');

  // Wait until mongoose is connected
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 300));
  }

  // Ensure users exist
  const User = require('./models/User');
  let userCount = await User.countDocuments();
  if (userCount === 0) {
    const { seedDatabase } = require('./utils/seedData');
    await seedDatabase(false);
  }

  const makeRequest = (path, method = 'GET', data = null, token = null) => {
    return new Promise((resolve, reject) => {
      const payload = data ? JSON.stringify(data) : '';
      const req = request.request(
        {
          hostname: 'localhost',
          port: process.env.PORT || 5000,
          path,
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(body) });
            } catch {
              resolve({ status: res.statusCode, raw: body });
            }
          });
        }
      );
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  };

  try {
    // 1. Test Admin Login
    console.log('1️⃣ Testing Admin Login (admin@dayflow.com)...');
    const adminLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@dayflow.com',
      password: 'admin123',
    });
    if (adminLoginRes.status !== 200 || !adminLoginRes.data.token || adminLoginRes.data.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes)}`);
    }
    console.log(`   ✅ Admin login successful! Token received. Role: ${adminLoginRes.data.user.role}`);
    const adminToken = adminLoginRes.data.token;

    // 2. Test Employee Login
    console.log('2️⃣ Testing Employee Login (alex@dayflow.com)...');
    const empLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'alex@dayflow.com',
      password: 'employee123',
    });
    if (empLoginRes.status !== 200 || !empLoginRes.data.token || empLoginRes.data.user.role !== 'employee') {
      throw new Error(`Employee login failed: ${JSON.stringify(empLoginRes)}`);
    }
    console.log(`   ✅ Employee login successful! Token received. Role: ${empLoginRes.data.user.role}`);
    const empToken = empLoginRes.data.token;

    // 3. Test Invalid Password Login
    console.log('3️⃣ Testing Invalid Password Login...');
    const badLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@dayflow.com',
      password: 'wrongpassword',
    });
    if (badLoginRes.status !== 401) {
      throw new Error(`Invalid password was not rejected with 401: status ${badLoginRes.status}`);
    }
    console.log('   ✅ Bad credentials correctly rejected with 401 Unauthorized.');

    // 4. Test Protected GET /api/auth/me with Bearer token
    console.log('4️⃣ Testing Protected Profile Fetch (GET /api/auth/me)...');
    const meRes = await makeRequest('/api/auth/me', 'GET', null, empToken);
    if (meRes.status !== 200 || meRes.data.user.email !== 'alex@dayflow.com') {
      throw new Error(`Profile fetch failed: ${JSON.stringify(meRes)}`);
    }
    console.log(`   ✅ Protected profile fetched successfully for ${meRes.data.user.name} (${meRes.data.user.designation})`);

    // 5. Test Unauthenticated Request to /api/auth/me
    console.log('5️⃣ Testing Unauthenticated Request rejection...');
    const unauthRes = await makeRequest('/api/auth/me', 'GET');
    if (unauthRes.status !== 401) {
      throw new Error(`Unauthenticated request was not rejected with 401: status ${unauthRes.status}`);
    }
    console.log('   ✅ Unauthenticated request correctly rejected with 401.');

    console.log('\n🎉 ALL PHASE 2 AUTHENTICATION & ROLE TESTS PASSED! ✅');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 2 test error:', err.message);
    process.exit(1);
  }
}

runPhase2Test();
