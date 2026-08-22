const request = require('http');

async function testDashboardData() {
  console.log('🧪 Testing Employee Dashboard Data Feeds & Activity Derivation...\n');

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
    // 1. Log in as Ananya Sharma
    console.log('1️⃣ Logging in as Ananya Sharma (alex@dayflow.com)...');
    const loginRes = await makeRequest('/api/auth/login', 'POST', {
      email: 'alex@dayflow.com',
      password: 'employee123',
    });

    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
    }
    const token = loginRes.data.token;
    const ananya = loginRes.data.user;
    console.log(`   ✅ Logged in successfully: ${ananya.name} (${ananya.employeeId})`);

    // 2. Test GET /api/attendance/my-history
    console.log('2️⃣ Testing GET /api/attendance/my-history...');
    const attRes = await makeRequest('/api/attendance/my-history?limit=30', 'GET', null, token);
    if (attRes.status !== 200 || !Array.isArray(attRes.data.records)) {
      throw new Error(`Attendance history failed: ${JSON.stringify(attRes)}`);
    }
    console.log(`   ✅ Attendance records: ${attRes.data.records.length} days found.`);

    // 3. Test GET /api/attendance/my-weekly
    console.log('3️⃣ Testing GET /api/attendance/my-weekly (7-Day Attendance Rhythm)...');
    const weekRes = await makeRequest('/api/attendance/my-weekly', 'GET', null, token);
    if (weekRes.status !== 200 || !Array.isArray(weekRes.data.weeklyDays)) {
      throw new Error(`Weekly view failed: ${JSON.stringify(weekRes)}`);
    }
    if (weekRes.data.weeklyDays.length !== 7) {
      throw new Error(`Expected 7 days in weekly view, got ${weekRes.data.weeklyDays.length}`);
    }
    console.log(`   ✅ Weekly 7-day rhythm retrieved (${weekRes.data.weeklyDays.length} days: ${weekRes.data.weeklyDays.map(d => d.shortDay + ':' + d.status).join(', ')})`);

    // 4. Test GET /api/attendance/weekly-view (Alias)
    console.log('4️⃣ Testing GET /api/attendance/weekly-view alias...');
    const weekAliasRes = await makeRequest('/api/attendance/weekly-view', 'GET', null, token);
    if (weekAliasRes.status !== 200) {
      throw new Error(`Weekly view alias failed with status: ${weekAliasRes.status}`);
    }
    console.log('   ✅ Weekly view alias works.');

    // 5. Test GET /api/salaries/my-payslips
    console.log('5️⃣ Testing GET /api/salaries/my-payslips...');
    const payRes = await makeRequest('/api/salaries/my-payslips', 'GET', null, token);
    if (payRes.status !== 200 || !Array.isArray(payRes.data.payslips)) {
      throw new Error(`Payslips failed: ${JSON.stringify(payRes)}`);
    }
    console.log(`   ✅ Payslips retrieved: ${payRes.data.payslips.length} record(s). Latest Net Pay: ₹${payRes.data.latest?.netSalary || payRes.data.payslips[0]?.netSalary}`);

    // 6. Test GET /api/leaves/my-leaves
    console.log('6️⃣ Testing GET /api/leaves/my-leaves...');
    const leavesRes = await makeRequest('/api/leaves/my-leaves', 'GET', null, token);
    if (leavesRes.status !== 200 || !Array.isArray(leavesRes.data.leaves)) {
      throw new Error(`Leaves failed: ${JSON.stringify(leavesRes)}`);
    }
    console.log(`   ✅ Leave applications retrieved: ${leavesRes.data.leaves.length} record(s).`);

    // 7. Verify Simulated Activity Aggregation
    console.log('7️⃣ Verifying Activity Aggregation Logic...');
    const rawActivities = [];

    // Attendance
    attRes.data.records.slice(0, 4).forEach((att) => {
      if (att.checkIn) {
        rawActivities.push({
          type: 'attendance',
          title: 'Daily Attendance Punch In',
          status: att.status || 'Present',
        });
      }
    });

    // Leaves
    leavesRes.data.leaves.slice(0, 4).forEach((lv) => {
      rawActivities.push({
        type: 'leave',
        title: `Leave: ${lv.leaveType}`,
        status: lv.status,
      });
    });

    // Payslips
    payRes.data.payslips.slice(0, 2).forEach((sal) => {
      rawActivities.push({
        type: 'salary',
        title: `Payslip: Net ₹${sal.netSalary}`,
        status: sal.paymentStatus || 'Paid',
      });
    });

    // Documents
    if (ananya.documents) {
      ananya.documents.slice(0, 3).forEach((doc) => {
        rawActivities.push({
          type: 'document',
          title: `Compliance Dossier: ${doc.name}`,
          status: doc.status,
        });
      });
    }

    console.log(`   ✅ Total Derived Activities for Ananya: ${rawActivities.length} real events!`);
    rawActivities.forEach((act, idx) => {
      console.log(`      [${idx + 1}] (${act.type}) ${act.title} - Status: ${act.status}`);
    });

    if (rawActivities.length === 0) {
      throw new Error('Activity feed derived 0 events!');
    }

    console.log('\n============================================================');
    console.log('🎉 ALL DASHBOARD DATA FEEDS & RECENT ACTIVITIES PASSED! 🚀');
    console.log('============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Dashboard test error:', err.message);
    process.exit(1);
  }
}

testDashboardData();
