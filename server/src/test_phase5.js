const mongoose = require('mongoose');
const request = require('http');

async function runPhase5Test() {
  console.log('🧪 Starting Phase 5 Leave & Time-Off Management Integration Tests...');

  // Start the server
  const app = require('./server');

  // Wait until mongoose is connected
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 300));
  }

  // Ensure users exist
  const User = require('./models/User');
  const Leave = require('./models/Leave');
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
    // 1. Authenticate Admin & create a fresh employee for clean balance isolation
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@dayflow.com',
      password: 'admin123',
    });
    const adminToken = adminLogin.data.token;

    const testEmpEmail = `leave.tester.${Date.now()}@dayflow.com`;
    const newEmpRes = await makeRequest(
      '/api/users',
      'POST',
      {
        name: 'Leave Tester',
        email: testEmpEmail,
        password: 'employee123',
        department: 'Product Design',
        designation: 'UI Designer',
        role: 'employee',
        leaveBalance: { paid: 10, sick: 5, unpaid: 0 },
      },
      adminToken
    );
    const testEmpId = newEmpRes.data.employee._id;

    // Login as employee
    const empLogin = await makeRequest('/api/auth/login', 'POST', {
      email: testEmpEmail,
      password: 'employee123',
    });
    const empToken = empLogin.data.token;

    // 1. Submit Paid Leave
    console.log('1️⃣ Testing Employee Submit Paid Leave (POST /api/leaves)...');
    const paidLeaveRes = await makeRequest(
      '/api/leaves',
      'POST',
      {
        leaveType: 'Paid',
        startDate: '2026-09-01',
        endDate: '2026-09-02',
        reason: 'Family wedding celebration',
      },
      empToken
    );
    if (paidLeaveRes.status !== 201 || paidLeaveRes.data.leave.daysCount !== 2) {
      throw new Error(`Paid leave submit failed: ${JSON.stringify(paidLeaveRes)}`);
    }
    console.log(`   ✅ Paid leave submitted for 2 days! Status: ${paidLeaveRes.data.leave.status}`);
    const paidLeaveId = paidLeaveRes.data.leave._id;

    // 2. Submit Sick Leave
    console.log('2️⃣ Testing Employee Submit Sick Leave (POST /api/leaves)...');
    const sickLeaveRes = await makeRequest(
      '/api/leaves',
      'POST',
      {
        leaveType: 'Sick',
        startDate: '2026-09-10',
        endDate: '2026-09-10',
        reason: 'Dental appointment & recovery',
      },
      empToken
    );
    if (sickLeaveRes.status !== 201 || sickLeaveRes.data.leave.daysCount !== 1) {
      throw new Error(`Sick leave submit failed: ${JSON.stringify(sickLeaveRes)}`);
    }
    console.log(`   ✅ Sick leave submitted for 1 day! Status: ${sickLeaveRes.data.leave.status}`);
    const sickLeaveId = sickLeaveRes.data.leave._id;

    // 3. Submit Unpaid Leave
    console.log('3️⃣ Testing Employee Submit Unpaid Leave (POST /api/leaves)...');
    const unpaidLeaveRes = await makeRequest(
      '/api/leaves',
      'POST',
      {
        leaveType: 'Unpaid',
        startDate: '2026-09-20',
        endDate: '2026-09-22',
        reason: 'Personal relocation trip',
      },
      empToken
    );
    if (unpaidLeaveRes.status !== 201 || unpaidLeaveRes.data.leave.daysCount !== 3) {
      throw new Error(`Unpaid leave submit failed: ${JSON.stringify(unpaidLeaveRes)}`);
    }
    console.log(`   ✅ Unpaid leave submitted for 3 days! Status: ${unpaidLeaveRes.data.leave.status}`);

    // 4. Test Invalid Date Range (startDate > endDate)
    console.log('4️⃣ Testing Invalid Date Range Rejection (startDate > endDate)...');
    const invalidDateRes = await makeRequest(
      '/api/leaves',
      'POST',
      {
        leaveType: 'Paid',
        startDate: '2026-10-15',
        endDate: '2026-10-10',
        reason: 'Time travel leave',
      },
      empToken
    );
    if (invalidDateRes.status !== 400) {
      throw new Error(`Invalid date range was not rejected with 400: status ${invalidDateRes.status}`);
    }
    console.log('   ✅ Invalid date range correctly rejected with 400 Bad Request.');

    // 5. Test Insufficient Leave Balance Rejection
    console.log('5️⃣ Testing Insufficient Leave Balance Rejection...');
    const excessLeaveRes = await makeRequest(
      '/api/leaves',
      'POST',
      {
        leaveType: 'Sick',
        startDate: '2026-11-01',
        endDate: '2026-11-10', // 10 days, but only 5 available
        reason: 'Long rest',
      },
      empToken
    );
    if (excessLeaveRes.status !== 400) {
      throw new Error(`Excess leave was not rejected with 400: status ${excessLeaveRes.status}`);
    }
    console.log('   ✅ Insufficient leave balance correctly rejected with 400 Bad Request.');

    // 6. Test Personal Leave History
    console.log('6️⃣ Testing Personal Leave History (GET /api/leaves/my-leaves)...');
    const myLeavesRes = await makeRequest('/api/leaves/my-leaves', 'GET', null, empToken);
    if (myLeavesRes.status !== 200 || myLeavesRes.data.leaves.length < 3) {
      throw new Error(`Personal leaves fetch failed: ${JSON.stringify(myLeavesRes)}`);
    }
    console.log(`   ✅ Personal leave history retrieved: ${myLeavesRes.data.leaves.length} applications. Pending: ${myLeavesRes.data.stats.pending}`);

    // 7. Test Employee Access Rejection on Admin Endpoint
    console.log('7️⃣ Testing Employee access rejection on GET /api/leaves/all (Should return 403)...');
    const empAllRes = await makeRequest('/api/leaves/all', 'GET', null, empToken);
    if (empAllRes.status !== 403) {
      throw new Error(`Employee was not forbidden: status ${empAllRes.status}`);
    }
    console.log('   ✅ Employee correctly blocked with 403 Forbidden.');

    // 8. Test Admin viewing all leave requests
    console.log('8️⃣ Admin fetching company leave requests (GET /api/leaves/all)...');
    const adminAllRes = await makeRequest('/api/leaves/all', 'GET', null, adminToken);
    if (adminAllRes.status !== 200 || !adminAllRes.data.leaves) {
      throw new Error(`Admin fetch failed: ${JSON.stringify(adminAllRes)}`);
    }
    console.log(`   ✅ Company leaves retrieved: ${adminAllRes.data.leaves.length} requests across organization.`);

    // 9. Admin Approves Paid Leave -> Verify balance deducted
    console.log('9️⃣ Admin approving Paid Leave (PUT /api/leaves/:id/status)...');
    const initialUser = await User.findById(testEmpId);
    const initialPaidBal = initialUser.leaveBalance.paid; // 10

    const approveRes = await makeRequest(
      `/api/leaves/${paidLeaveId}/status`,
      'PUT',
      { status: 'Approved', adminComment: 'Approved by Sarah Jenkins (HR)' },
      adminToken
    );
    if (approveRes.status !== 200 || approveRes.data.leave.status !== 'Approved') {
      throw new Error(`Approval failed: ${JSON.stringify(approveRes)}`);
    }

    const updatedUserAfterApprove = await User.findById(testEmpId);
    if (updatedUserAfterApprove.leaveBalance.paid !== initialPaidBal - 2) {
      throw new Error(`Leave balance was not deducted correctly. Expected ${initialPaidBal - 2}, got ${updatedUserAfterApprove.leaveBalance.paid}`);
    }
    console.log(`   ✅ Paid leave approved! Leave balance updated: ${initialPaidBal} -> ${updatedUserAfterApprove.leaveBalance.paid} days.`);

    // 10. Verify No Double Deduction on Reprocessing
    console.log('🔟 Verifying double-deduction prevention on already approved leave...');
    await makeRequest(
      `/api/leaves/${paidLeaveId}/status`,
      'PUT',
      { status: 'Approved', adminComment: 'Updated remarks without balance re-deduction' },
      adminToken
    );
    const recheckUser = await User.findById(testEmpId);
    if (recheckUser.leaveBalance.paid !== initialPaidBal - 2) {
      throw new Error('Double deduction occurred on re-saving approved leave!');
    }
    console.log('   ✅ Double deduction prevented! Balance remained stable.');

    // 11. Admin Rejects Sick Leave with Comment
    console.log('1️⃣1️⃣ Admin rejecting Sick Leave with remarks (PUT /api/leaves/:id/status)...');
    const rejectRes = await makeRequest(
      `/api/leaves/${sickLeaveId}/status`,
      'PUT',
      { status: 'Rejected', adminComment: 'Please adjust date to avoid team demo conflict' },
      adminToken
    );
    if (rejectRes.status !== 200 || rejectRes.data.leave.status !== 'Rejected' || !rejectRes.data.leave.adminComment) {
      throw new Error(`Rejection failed: ${JSON.stringify(rejectRes)}`);
    }
    console.log(`   ✅ Leave rejected with comment: "${rejectRes.data.leave.adminComment}"`);

    console.log('\n🎉 ALL PHASE 5 LEAVE MANAGEMENT TESTS PASSED! ✅');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 5 test error:', err.message);
    process.exit(1);
  }
}

runPhase5Test();
