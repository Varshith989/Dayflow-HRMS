const mongoose = require('mongoose');
const request = require('http');

async function runPhase6Test() {
  console.log('🧪 Starting Phase 6 Payroll & Salary Management Integration Tests...');

  // Start the server
  const app = require('./server');

  // Wait until mongoose is connected
  while (mongoose.connection.readyState !== 1) {
    await new Promise((r) => setTimeout(r, 300));
  }

  // Ensure users exist
  const User = require('./models/User');
  const Salary = require('./models/Salary');
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
    // 1. Authenticate Admin & create a fresh employee for clean payroll isolation
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@dayflow.com',
      password: 'admin123',
    });
    const adminToken = adminLogin.data.token;

    const testEmpEmail = `payroll.tester.${Date.now()}@dayflow.com`;
    const newEmpRes = await makeRequest(
      '/api/users',
      'POST',
      {
        name: 'Payroll Tester',
        email: testEmpEmail,
        password: 'employee123',
        department: 'Finance',
        designation: 'Financial Analyst',
        role: 'employee',
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

    // 1. Admin generates salary for test employee (August 2026)
    console.log('1️⃣ Admin generating salary payslip for employee (POST /api/salaries)...');
    const createSalaryRes = await makeRequest(
      '/api/salaries',
      'POST',
      {
        userId: testEmpId,
        month: 8,
        year: 2026,
        basicSalary: 60000,
        hra: 20000,
        allowances: 10000,
        deductions: { tax: 5000, pf: 3000, unpaidLeaveDeduction: 0, other: 0 },
        paymentStatus: 'Paid',
      },
      adminToken
    );
    if (createSalaryRes.status !== 201 || !createSalaryRes.data.salary) {
      throw new Error(`Salary creation failed: ${JSON.stringify(createSalaryRes)}`);
    }
    const createdSalary = createSalaryRes.data.salary;
    const expectedNet = (60000 + 20000 + 10000) - (5000 + 3000); // 82000
    if (createdSalary.netSalary !== expectedNet) {
      throw new Error(`Net salary calculation error: expected ${expectedNet}, got ${createdSalary.netSalary}`);
    }
    console.log(`   ✅ Payslip generated! Gross: ₹${createdSalary.grossSalary}, Net: ₹${createdSalary.netSalary}`);
    const salaryId = createdSalary._id;

    // 2. Employee fetches own payslips
    console.log('2️⃣ Employee fetching own payslip (GET /api/salaries/my-payslips)...');
    const myPayslipsRes = await makeRequest('/api/salaries/my-payslips', 'GET', null, empToken);
    if (myPayslipsRes.status !== 200 || myPayslipsRes.data.payslips.length === 0) {
      throw new Error(`Employee payslips fetch failed: ${JSON.stringify(myPayslipsRes)}`);
    }
    console.log(`   ✅ Employee received ${myPayslipsRes.data.payslips.length} payslip(s). Latest Net Pay: ₹${myPayslipsRes.data.latest.netSalary}`);

    // 3. Employee attempts to access company-wide payroll (Should return 403)
    console.log('3️⃣ Employee trying to access GET /api/salaries/all (Should return 403)...');
    const empAllRes = await makeRequest('/api/salaries/all', 'GET', null, empToken);
    if (empAllRes.status !== 403) {
      throw new Error(`Employee access was not forbidden: status ${empAllRes.status}`);
    }
    console.log('   ✅ Employee correctly blocked with 403 Forbidden.');

    // 4. Employee attempts to modify salary (Should return 403)
    console.log(`4️⃣ Employee trying to modify salary (PUT /api/salaries/${salaryId}) (Should return 403)...`);
    const empTamperRes = await makeRequest(
      `/api/salaries/${salaryId}`,
      'PUT',
      { basicSalary: 1000000 },
      empToken
    );
    if (empTamperRes.status !== 403) {
      throw new Error(`Employee modification was not forbidden: status ${empTamperRes.status}`);
    }
    console.log('   ✅ Unauthorized employee salary modification correctly blocked with 403 Forbidden.');

    // 5. Admin fetches company-wide payroll
    console.log('5️⃣ Admin fetching company-wide payroll (GET /api/salaries/all)...');
    const adminAllRes = await makeRequest('/api/salaries/all', 'GET', null, adminToken);
    if (adminAllRes.status !== 200 || !adminAllRes.data.records) {
      throw new Error(`Admin payroll fetch failed: ${JSON.stringify(adminAllRes)}`);
    }
    console.log(`   ✅ Company payroll retrieved: ${adminAllRes.data.records.length} records. Total Disbursed: ₹${adminAllRes.data.stats.totalDisbursed}`);

    // 6. Admin updates salary components & checks auto-recalculation
    console.log('6️⃣ Admin updating salary components (PUT /api/salaries/:id)...');
    const updateRes = await makeRequest(
      `/api/salaries/${salaryId}`,
      'PUT',
      {
        basicSalary: 70000,
        hra: 25000,
        allowances: 15000, // Total Gross: 110,000
        deductions: { tax: 8000, pf: 4000, unpaidLeaveDeduction: 0, other: 0 }, // Total Deductions: 12,000
        paymentStatus: 'Paid',
      },
      adminToken
    );
    if (updateRes.status !== 200 || updateRes.data.salary.netSalary !== 98000) {
      throw new Error(`Salary update calculation failed: ${JSON.stringify(updateRes)}`);
    }
    console.log(`   ✅ Salary components updated! New Net Salary: ₹${updateRes.data.salary.netSalary} (Gross: ₹${updateRes.data.salary.grossSalary})`);

    console.log('\n🎉 ALL PHASE 6 PAYROLL & SALARY TESTS PASSED! ✅');
    process.exit(0);
  } catch (err) {
    console.error('❌ Phase 6 test error:', err.message);
    process.exit(1);
  }
}

runPhase6Test();
