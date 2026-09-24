const mongoose = require('mongoose');
const request = require('http');

async function runPhase7E2ERegressionTest() {
  console.log('🧪 Starting Phase 7 End-to-End Comprehensive Regression Test Suite...\n');

  // Start the server
  const app = require('./server');

  // Wait until mongoose is connected
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 300));
  }

  // Ensure DB seed exists
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
    // ----------------------------------------------------
    // MODULE 1: AUTHENTICATION & ROLE-BASED ACCESS
    // ----------------------------------------------------
    console.log('📌 [MODULE 1] Authentication & RBAC Verification...');
    const adminAuth = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@dayflow.com',
      password: 'admin123',
    });
    if (adminAuth.status !== 200 || adminAuth.data.user.role !== 'admin') {
      throw new Error('Admin authentication failed');
    }
    const adminToken = adminAuth.data.token;
    console.log('   ✅ Admin login successful (Role: admin)');

    const empAuth = await makeRequest('/api/auth/login', 'POST', {
      email: 'alex@dayflow.com',
      password: 'employee123',
    });
    if (empAuth.status !== 200 || empAuth.data.user.role !== 'employee') {
      throw new Error('Employee authentication failed');
    }
    const empToken = empAuth.data.token;
    console.log('   ✅ Employee login successful (Role: employee)');

    // ----------------------------------------------------
    // MODULE 2: EMPLOYEE DIRECTORY & PROFILE MANAGEMENT
    // ----------------------------------------------------
    console.log('\n📌 [MODULE 2] Employee Directory & Profile Management...');
    const testEmpEmail = `e2e.tester.${Date.now()}@dayflow.com`;
    const createEmpRes = await makeRequest(
      '/api/users',
      'POST',
      {
        name: 'E2E Fullstack Tester',
        email: testEmpEmail,
        password: 'employee123',
        department: 'Engineering',
        designation: 'Senior QA Engineer',
        role: 'employee',
        phone: '+91 9876543210',
        leaveBalance: { paid: 15, sick: 10, unpaid: 0 },
      },
      adminToken
    );
    if (createEmpRes.status !== 201) throw new Error('Employee creation failed');
    const createdEmpId = createEmpRes.data.employee._id;
    console.log(`   ✅ Admin onboarded new employee: ${createEmpRes.data.employee.name} (${createEmpRes.data.employee.employeeId})`);

    // Employee updates profile contact
    const e2eEmpLogin = await makeRequest('/api/auth/login', 'POST', {
      email: testEmpEmail,
      password: 'employee123',
    });
    const e2eEmpToken = e2eEmpLogin.data.token;

    const updateProfileRes = await makeRequest(
      '/api/users/profile',
      'PUT',
      { phone: '+91 9998887776', address: { city: 'Bangalore', state: 'Karnataka' } },
      e2eEmpToken
    );
    const updatedPhone = updateProfileRes.data.employee?.phone || updateProfileRes.data.user?.phone;
    if (updateProfileRes.status !== 200 || updatedPhone !== '+91 9998887776') {
      throw new Error(`Profile update failed: ${JSON.stringify(updateProfileRes)}`);
    }
    console.log('   ✅ Employee successfully updated contact & address details');

    // ----------------------------------------------------
    // MODULE 3: ATTENDANCE SYSTEM
    // ----------------------------------------------------
    console.log('\n📌 [MODULE 3] Attendance Punch & Hours Calculation...');
    const punchInRes = await makeRequest(
      '/api/attendance/check-in',
      'POST',
      { workMode: 'Office', notes: 'E2E punch test' },
      e2eEmpToken
    );
    const attIn = punchInRes.data.attendance || punchInRes.data.record;
    if (punchInRes.status !== 200 || !attIn?.checkIn) {
      throw new Error(`Check-in failed: ${JSON.stringify(punchInRes)}`);
    }
    console.log(`   ✅ Employee Checked In successfully! Status: ${attIn.status}`);

    const punchOutRes = await makeRequest(
      '/api/attendance/check-out',
      'POST',
      { notes: 'E2E checkout test' },
      e2eEmpToken
    );
    const attOut = punchOutRes.data.attendance || punchOutRes.data.record;
    if (punchOutRes.status !== 200 || !attOut?.checkOut) {
      throw new Error(`Check-out failed: ${JSON.stringify(punchOutRes)}`);
    }
    console.log(`   ✅ Employee Checked Out successfully! Total Hours: ${attOut.totalHours} hrs`);

    // Duplicate check-in prevention
    const duplicatePunch = await makeRequest(
      '/api/attendance/check-in',
      'POST',
      { workMode: 'Remote' },
      e2eEmpToken
    );
    if (duplicatePunch.status !== 400) throw new Error('Duplicate check-in was not prevented');
    console.log('   ✅ Duplicate check-in on same day prevented with 400 Bad Request');

    // ----------------------------------------------------
    // MODULE 4: LEAVE & TIME-OFF MANAGEMENT
    // ----------------------------------------------------
    console.log('\n📌 [MODULE 4] Leave & Time-Off Management...');
    const leaveApplyRes = await makeRequest(
      '/api/leaves',
      'POST',
      {
        leaveType: 'Paid',
        startDate: '2026-09-15',
        endDate: '2026-09-17', // 3 days
        reason: 'Annual family festival celebration',
      },
      e2eEmpToken
    );
    if (leaveApplyRes.status !== 201 || leaveApplyRes.data.leave.daysCount !== 3) {
      throw new Error('Leave application failed');
    }
    const leaveId = leaveApplyRes.data.leave._id;
    console.log(`   ✅ Leave request submitted (3 days Paid Leave). Status: Pending`);

    // Admin approves leave
    const approveLeaveRes = await makeRequest(
      `/api/leaves/${leaveId}/status`,
      'PUT',
      { status: 'Approved', adminComment: 'Approved for annual festival' },
      adminToken
    );
    if (approveLeaveRes.status !== 200 || approveLeaveRes.data.leave.status !== 'Approved') {
      throw new Error('Leave approval failed');
    }
    const empAfterLeave = await User.findById(createdEmpId);
    if (empAfterLeave.leaveBalance.paid !== 12) { // 15 - 3 = 12
      throw new Error(`Leave balance deduction failed. Expected 12, got ${empAfterLeave.leaveBalance.paid}`);
    }
    console.log(`   ✅ Admin approved leave! Leave balance deducted: 15 -> ${empAfterLeave.leaveBalance.paid} days`);

    // ----------------------------------------------------
    // MODULE 5: PAYROLL & SALARY COMPENSATION
    // ----------------------------------------------------
    console.log('\n📌 [MODULE 5] Payroll & Compensation Management...');
    const genSalaryRes = await makeRequest(
      '/api/salaries',
      'POST',
      {
        userId: createdEmpId,
        month: 8,
        year: 2026,
        basicSalary: 80000,
        hra: 25000,
        allowances: 15000,
        deductions: { tax: 8000, pf: 4000, unpaidLeaveDeduction: 0, other: 0 },
        paymentStatus: 'Paid',
      },
      adminToken
    );
    if (genSalaryRes.status !== 201) throw new Error('Salary generation failed');
    const createdSalary = genSalaryRes.data.salary;
    const expectedNet = (80000 + 25000 + 15000) - (8000 + 4000); // 108,000
    if (createdSalary.netSalary !== expectedNet) {
      throw new Error(`Net salary calculation mismatch: expected ${expectedNet}, got ${createdSalary.netSalary}`);
    }
    console.log(`   ✅ Payslip created! Gross: ₹${createdSalary.grossSalary}, Net: ₹${createdSalary.netSalary}`);

    // Employee views own payslip
    const myPayslips = await makeRequest('/api/salaries/my-payslips', 'GET', null, e2eEmpToken);
    if (myPayslips.status !== 200 || myPayslips.data.payslips.length === 0) {
      throw new Error('Employee payslips retrieval failed');
    }
    console.log(`   ✅ Employee verified own payslip (Take-home: ₹${myPayslips.data.latest.netSalary})`);

    // Employee forbidden from payroll management
    const forbiddenPayroll = await makeRequest('/api/salaries/all', 'GET', null, e2eEmpToken);
    if (forbiddenPayroll.status !== 403) throw new Error('Employee was not forbidden from payroll');
    console.log('   ✅ Employee blocked from organization payroll with 403 Forbidden');

    console.log('\n============================================================');
    console.log('🎉 ALL END-TO-END REGRESSION TESTS PASSED WITH 100% SUCCESS! 🚀');
    console.log('============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ E2E Regression test error:', err.message);
    process.exit(1);
  }
}

runPhase7E2ERegressionTest();
