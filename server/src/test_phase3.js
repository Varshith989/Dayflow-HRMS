const mongoose = require('mongoose');
const request = require('http');

async function runPhase3Test() {
  console.log('🧪 Starting Phase 3 User Management & Role Authorization Tests...');

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
    // Authenticate Admin
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@dayflow.com',
      password: 'admin123',
    });
    const adminToken = adminLogin.data.token;

    // Authenticate Employee (Alex)
    const empLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'alex@dayflow.com',
      password: 'employee123',
    });
    const empToken = empLogin.data.token;
    const alexId = empLogin.data.user.id;

    // 1. Admin gets all employees
    console.log('1️⃣ Admin fetching employee directory (GET /api/users)...');
    const allUsersRes = await makeRequest('/api/users', 'GET', null, adminToken);
    if (allUsersRes.status !== 200 || allUsersRes.data.employees.length < 4) {
      throw new Error(`Admin fetch failed: ${JSON.stringify(allUsersRes)}`);
    }
    console.log(`   ✅ Success! ${allUsersRes.data.employees.length} employees retrieved.`);

    // 2. Admin filters by search
    console.log('2️⃣ Admin search filter (GET /api/users?search=alex)...');
    const searchRes = await makeRequest('/api/users?search=alex', 'GET', null, adminToken);
    if (searchRes.status !== 200 || searchRes.data.employees[0].email !== 'alex@dayflow.com') {
      throw new Error(`Search filter failed: ${JSON.stringify(searchRes)}`);
    }
    console.log(`   ✅ Search filter matched: ${searchRes.data.employees[0].name}`);

    // 3. Employee tries to access admin directory (Should be rejected with 403)
    console.log('3️⃣ Testing Employee access rejection on GET /api/users (Should return 403)...');
    const empDirRes = await makeRequest('/api/users', 'GET', null, empToken);
    if (empDirRes.status !== 403) {
      throw new Error(`Employee was not forbidden: status ${empDirRes.status}`);
    }
    console.log('   ✅ Employee correctly blocked with 403 Forbidden.');

    // 4. Admin creates new employee
    console.log('4️⃣ Admin onboarding a new employee (POST /api/users)...');
    const newEmpRes = await makeRequest(
      '/api/users',
      'POST',
      {
        name: 'David Kim',
        email: `david.kim.${Date.now()}@dayflow.com`,
        department: 'Engineering',
        designation: 'DevOps Engineer',
        phone: '+91 99887 76655',
        role: 'employee',
        leaveBalance: { paid: 15, sick: 10, unpaid: 0 },
      },
      adminToken
    );
    if (newEmpRes.status !== 201 || !newEmpRes.data.employee.employeeId) {
      throw new Error(`Employee creation failed: ${JSON.stringify(newEmpRes)}`);
    }
    console.log(`   ✅ New employee onboarded: ${newEmpRes.data.employee.name} (${newEmpRes.data.employee.employeeId})`);

    // 5. Employee tries to create new employee (Should be rejected with 403)
    console.log('5️⃣ Testing Employee creation rejection on POST /api/users (Should return 403)...');
    const empCreateRes = await makeRequest(
      '/api/users',
      'POST',
      {
        name: 'Unauthorized User',
        email: 'hacker@dayflow.com',
        department: 'Finance',
        designation: 'Auditor',
      },
      empToken
    );
    if (empCreateRes.status !== 403) {
      throw new Error(`Employee was not forbidden from creating user: status ${empCreateRes.status}`);
    }
    console.log('   ✅ Unauthorized employee creation correctly blocked with 403 Forbidden.');

    // 6. Employee updating their own profile
    console.log(`6️⃣ Employee updating their own profile (PUT /api/users/${alexId})...`);
    const empUpdateRes = await makeRequest(
      `/api/users/${alexId}`,
      'PUT',
      {
        phone: '+91 98112 99999',
        address: { city: 'Bangalore East' },
      },
      empToken
    );
    if (empUpdateRes.status !== 200 || empUpdateRes.data.employee.phone !== '+91 98112 99999') {
      throw new Error(`Self-profile update failed: ${JSON.stringify(empUpdateRes)}`);
    }
    console.log('   ✅ Employee self-profile update passed.');

    // 7. Employee trying to update another user's profile (Should return 403)
    console.log('7️⃣ Employee trying to modify another employee profile (Should return 403)...');
    const adminUser = await User.findOne({ email: 'admin@dayflow.com' });
    const empTamperRes = await makeRequest(
      `/api/users/${adminUser._id}`,
      'PUT',
      { phone: '+91 00000 00000' },
      empToken
    );
    if (empTamperRes.status !== 403) {
      throw new Error(`Tampering was not forbidden: status ${empTamperRes.status}`);
    }
    console.log('   ✅ Unauthorized cross-profile tampering correctly blocked with 403 Forbidden.');

    console.log('\n🎉 ALL PHASE 3 USER & PERMISSION TESTS PASSED! ✅');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 3 test error:', err.message);
    process.exit(1);
  }
}

runPhase3Test();
