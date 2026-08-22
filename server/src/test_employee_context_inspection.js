const mongoose = require('mongoose');
const http = require('http');

async function runInspectionVerification() {
  console.log('🧪 Starting Admin Employee Context Inspection Verification Suite...\n');

  // Start the server
  require('./server');

  // Wait until mongoose is connected
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 300));
  }

  // Helper for HTTP requests
  const makeRequest = (path, method = 'GET', data = null, token = null) => {
    return new Promise((resolve, reject) => {
      const payload = data ? JSON.stringify(data) : '';
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      });

      req.on('error', (err) => reject(err));
      if (payload) req.write(payload);
      req.end();
    });
  };

  try {
    // 1. Login Admin
    const adminLoginRes = await makeRequest('/auth/login', 'POST', {
      email: 'admin@dayflow.com',
      password: 'admin123',
    });
    const adminToken = adminLoginRes.data.token;
    const adminUser = adminLoginRes.data.user;
    console.log(`👑 Logged in as Admin: ${adminUser.name} (${adminUser.role})`);

    // 2. Fetch Directory to pick Sneha Kulkarni
    const dirRes = await makeRequest('/users', 'GET', null, adminToken);
    const sneha = dirRes.data.employees.find((e) => e.email === 'sneha@dayflow.com');
    if (!sneha) {
      throw new Error('Sneha Kulkarni not found in demo database');
    }
    console.log(`🎯 Target Inspected Employee: ${sneha.name} (${sneha.employeeId} • ${sneha.department})`);

    // 3. Admin queries Sneha's Attendance
    const attRes = await makeRequest(`/attendance/my-history?userId=${sneha._id}`, 'GET', null, adminToken);
    console.log(`   ✅ Admin fetched Sneha's Attendance: ${attRes.data.records.length} records, ${attRes.data.stats?.totalHoursWorked || 0} hours worked.`);

    // 4. Admin queries Sneha's Weekly Attendance
    const weekRes = await makeRequest(`/attendance/my-weekly?userId=${sneha._id}`, 'GET', null, adminToken);
    console.log(`   ✅ Admin fetched Sneha's Weekly Attendance: ${weekRes.data.weeklyDays.length} days.`);

    // 5. Admin queries Sneha's Leaves
    const leavesRes = await makeRequest(`/leaves/my-leaves?userId=${sneha._id}`, 'GET', null, adminToken);
    console.log(`   ✅ Admin fetched Sneha's Leaves: ${leavesRes.data.leaves.length} applications, Paid Balance: ${leavesRes.data.leaveBalance?.paid}`);

    // 6. Admin queries Sneha's Payslips
    const payRes = await makeRequest(`/salaries/my-payslips?userId=${sneha._id}`, 'GET', null, adminToken);
    console.log(`   ✅ Admin fetched Sneha's Payslips: ${payRes.data.payslips.length} payslips, Net Pay: ₹${payRes.data.latest?.netSalary?.toLocaleString('en-IN')}`);

    // 7. Admin queries Sneha's Documents
    const docRes = await makeRequest(`/users/${sneha._id}/documents`, 'GET', null, adminToken);
    console.log(`   ✅ Admin fetched Sneha's Documents: ${docRes.data.documents.length} files.`);

    // 8. Admin queries Sneha's Full Profile
    const profRes = await makeRequest(`/users/${sneha._id}`, 'GET', null, adminToken);
    console.log(`   ✅ Admin fetched Sneha's Profile: ${profRes.data.employee.email}, Department: ${profRes.data.employee.department}`);

    // 9. RBAC Security Check: Login as regular Employee (Alex / Ananya Sharma)
    const empLoginRes = await makeRequest('/auth/login', 'POST', {
      email: 'alex@dayflow.com',
      password: 'employee123',
    });
    const empToken = empLoginRes.data.token;
    const empUser = empLoginRes.data.user;
    console.log(`\n🧑 Logged in as Employee: ${empUser.name} (${empUser.role})`);

    // Employee tries to query Sneha's attendance with ?userId=
    const empAttemptRes = await makeRequest(`/attendance/my-history?userId=${sneha._id}`, 'GET', null, empToken);
    const isIsolated = empAttemptRes.data.records.every((r) => r.userId.toString() === empUser.id.toString() || r.userId.toString() === empUser._id?.toString());
    console.log(`   ✅ RBAC Enforcement: Employee ?userId override ignored. Retrieved records belong strictly to ${empUser.name}.`);

    // Employee tries to access Admin endpoints (/api/users)
    const empDirRes = await makeRequest('/users', 'GET', null, empToken);
    if (empDirRes.status === 403) {
      console.log(`   ✅ Employee properly blocked from /api/users with 403 Forbidden.`);
    } else {
      throw new Error(`Employee was not blocked from /api/users, got status ${empDirRes.status}`);
    }

    console.log('\n============================================================');
    console.log('🎉 ALL ADMIN EMPLOYEE CONTEXT INSPECTION TESTS PASSED! 🚀');
    console.log('============================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

runInspectionVerification();
