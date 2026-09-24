const mongoose = require('mongoose');
const request = require('http');

async function runPhase4Test() {
  console.log('🧪 Starting Phase 4 Attendance Module Integration Tests...');

  // Start the server
  const app = require('./server');

  // Wait until mongoose is connected
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 300));
  }

  // Ensure users exist
  const User = require('./models/User');
  const Attendance = require('./models/Attendance');
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

    // Create a fresh test employee for punch verification to avoid seed collision
    const testEmpEmail = `punch.test.${Date.now()}@dayflow.com`;
    const newEmpRes = await makeRequest(
      '/api/users',
      'POST',
      {
        name: 'Test Puncher',
        email: testEmpEmail,
        password: 'employee123',
        department: 'Engineering',
        designation: 'QA Tester',
        role: 'employee',
      },
      adminToken
    );
    const testEmpId = newEmpRes.data.employee._id;

    // Login as fresh test employee
    const empLogin = await makeRequest('/api/auth/login', 'POST', {
      email: testEmpEmail,
      password: 'employee123',
    });
    const empToken = empLogin.data.token;

    // 1. Test Employee Check-In
    console.log('1️⃣ Testing Employee Check-In (POST /api/attendance/check-in)...');
    const checkInRes = await makeRequest(
      '/api/attendance/check-in',
      'POST',
      { workMode: 'Office', remarks: 'Morning check in for test' },
      empToken
    );
    if (checkInRes.status !== 200 || !checkInRes.data.attendance.checkIn) {
      throw new Error(`CheckIn failed: ${JSON.stringify(checkInRes)}`);
    }
    console.log(`   ✅ Check-in successful! Timestamp: ${checkInRes.data.attendance.checkIn}`);

    // 2. Test Duplicate Check-In Rejection
    console.log('2️⃣ Testing Duplicate Check-In rejection (Should return 400)...');
    const dupCheckInRes = await makeRequest(
      '/api/attendance/check-in',
      'POST',
      { workMode: 'Office' },
      empToken
    );
    if (dupCheckInRes.status !== 400) {
      throw new Error(`Duplicate check-in was not rejected with 400: status ${dupCheckInRes.status}`);
    }
    console.log('   ✅ Duplicate check-in correctly rejected with 400 Bad Request.');

    // 3. Test Today Status
    console.log('3️⃣ Testing Today Status (GET /api/attendance/today)...');
    const todayRes = await makeRequest('/api/attendance/today', 'GET', null, empToken);
    if (todayRes.status !== 200 || !todayRes.data.isCheckedIn || todayRes.data.isCheckedOut) {
      throw new Error(`Today status check failed: ${JSON.stringify(todayRes)}`);
    }
    console.log('   ✅ Today status verified: isCheckedIn=true, isCheckedOut=false.');

    // 4. Test Employee Check-Out
    console.log('4️⃣ Testing Employee Check-Out (POST /api/attendance/check-out)...');
    const checkOutRes = await makeRequest(
      '/api/attendance/check-out',
      'POST',
      { remarks: 'Day wrap up' },
      empToken
    );
    if (checkOutRes.status !== 200 || !checkOutRes.data.attendance.checkOut) {
      throw new Error(`CheckOut failed: ${JSON.stringify(checkOutRes)}`);
    }
    console.log(`   ✅ Check-out successful! Total calculated hours: ${checkOutRes.data.attendance.totalHours} hrs.`);

    // 5. Test Duplicate Check-Out Rejection
    console.log('5️⃣ Testing Duplicate Check-Out rejection (Should return 400)...');
    const dupCheckOutRes = await makeRequest(
      '/api/attendance/check-out',
      'POST',
      { remarks: 'Repeat' },
      empToken
    );
    if (dupCheckOutRes.status !== 400) {
      throw new Error(`Duplicate check-out was not rejected with 400: status ${dupCheckOutRes.status}`);
    }
    console.log('   ✅ Duplicate check-out correctly rejected with 400 Bad Request.');

    // 6. Test Personal Attendance History
    console.log('6️⃣ Testing Personal Attendance History (GET /api/attendance/my-history)...');
    const historyRes = await makeRequest('/api/attendance/my-history', 'GET', null, empToken);
    if (historyRes.status !== 200 || historyRes.data.records.length === 0) {
      throw new Error(`History fetch failed: ${JSON.stringify(historyRes)}`);
    }
    console.log(`   ✅ History retrieved: ${historyRes.data.records.length} records. Stats Present: ${historyRes.data.stats.presentCount}`);

    // 7. Test Weekly View
    console.log('7️⃣ Testing Weekly View (GET /api/attendance/my-weekly)...');
    const weeklyRes = await makeRequest('/api/attendance/my-weekly', 'GET', null, empToken);
    if (weeklyRes.status !== 200 || weeklyRes.data.weeklyDays.length !== 7) {
      throw new Error(`Weekly view failed: ${JSON.stringify(weeklyRes)}`);
    }
    console.log(`   ✅ Weekly calendar retrieved: 7 days (${weeklyRes.data.weekStart} to ${weeklyRes.data.weekEnd}).`);

    // 8. Test Employee Access Rejection on Admin Endpoint
    console.log('8️⃣ Testing Employee access rejection on GET /api/attendance/all (Should return 403)...');
    const empAllRes = await makeRequest('/api/attendance/all', 'GET', null, empToken);
    if (empAllRes.status !== 403) {
      throw new Error(`Employee was not forbidden: status ${empAllRes.status}`);
    }
    console.log('   ✅ Employee correctly blocked with 403 Forbidden.');

    // 9. Test Admin Company Attendance
    console.log('9️⃣ Admin viewing company attendance (GET /api/attendance/all)...');
    const adminAllRes = await makeRequest('/api/attendance/all', 'GET', null, adminToken);
    if (adminAllRes.status !== 200 || !adminAllRes.data.records) {
      throw new Error(`Admin fetch company attendance failed: ${JSON.stringify(adminAllRes)}`);
    }
    console.log(`   ✅ Company attendance retrieved: ${adminAllRes.data.records.length} punches on ${adminAllRes.data.date}`);

    // 10. Admin Regularizing / Updating Attendance
    console.log('🔟 Admin regularizing attendance record (PUT /api/attendance/:id)...');
    const recordToUpdate = checkOutRes.data.attendance._id;
    const updateRes = await makeRequest(
      `/api/attendance/${recordToUpdate}`,
      'PUT',
      {
        totalHours: 8.5,
        status: 'Present',
        remarks: 'HR regularized to standard 8.5 hrs',
      },
      adminToken
    );
    if (updateRes.status !== 200 || updateRes.data.record.totalHours !== 8.5) {
      throw new Error(`Regularization failed: ${JSON.stringify(updateRes)}`);
    }
    console.log(`   ✅ Attendance regularized successfully by HR Admin.`);

    console.log('\n🎉 ALL PHASE 4 ATTENDANCE MODULE TESTS PASSED! ✅');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 4 test error:', err.message);
    process.exit(1);
  }
}

runPhase4Test();
