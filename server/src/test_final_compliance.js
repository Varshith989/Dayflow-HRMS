const mongoose = require('mongoose');
const request = require('http');

async function runFinalComplianceTests() {
  console.log('🧪 Starting Final Requirement Compliance Verification Suite...\n');

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
    // ==========================================
    // MODULE 1: SIGN UP / REGISTRATION
    // ==========================================
    console.log('📌 [MODULE 1] Sign Up / Registration & Validation...');

    const testEmpId = `EMP-TEST-${Date.now()}`;
    const testEmail = `new.employee.${Date.now()}@dayflow.com`;

    // 1.1 Sign up with valid Employee details
    const regEmpRes = await makeRequest('/api/auth/register', 'POST', {
      employeeId: testEmpId,
      name: 'Aditya Deshmukh',
      email: testEmail,
      password: 'strongPassword123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Backend Developer',
    });
    if (regEmpRes.status !== 201 || regEmpRes.data.user?.isVerified !== false) {
      throw new Error(`Employee registration failed: ${JSON.stringify(regEmpRes)}`);
    }
    console.log('   ✅ Valid Employee Sign Up passed. Account is unverified.');

    const verificationToken = regEmpRes.data.demoVerification?.token;

    // 1.2 Sign up with valid HR details
    const testHrId = `HR-TEST-${Date.now()}`;
    const testHrEmail = `new.hr.${Date.now()}@dayflow.com`;
    const regHrRes = await makeRequest('/api/auth/register', 'POST', {
      employeeId: testHrId,
      name: 'Meera Sen',
      email: testHrEmail,
      password: 'strongPassword123',
      role: 'hr',
      department: 'Human Resources',
    });
    if (regHrRes.status !== 201 || regHrRes.data.user?.role !== 'admin') {
      throw new Error(`HR registration failed: ${JSON.stringify(regHrRes)}`);
    }
    console.log('   ✅ Valid HR Sign Up passed. Assigned role is admin.');

    // 1.3 Duplicate email rejected
    const dupEmailRes = await makeRequest('/api/auth/register', 'POST', {
      employeeId: `EMP-DUP-${Date.now()}`,
      name: 'Duplicate Tester',
      email: testEmail,
      password: 'password123',
    });
    if (dupEmailRes.status !== 400) {
      throw new Error(`Duplicate email was not rejected: ${dupEmailRes.status}`);
    }
    console.log('   ✅ Duplicate email rejected with 400 Bad Request.');

    // 1.4 Duplicate Employee ID rejected
    const dupIdRes = await makeRequest('/api/auth/register', 'POST', {
      employeeId: testEmpId,
      name: 'Duplicate ID Tester',
      email: `unique.${Date.now()}@dayflow.com`,
      password: 'password123',
    });
    if (dupIdRes.status !== 400) {
      throw new Error(`Duplicate employee ID was not rejected: ${dupIdRes.status}`);
    }
    console.log('   ✅ Duplicate Employee ID rejected with 400 Bad Request.');

    // 1.5 Short password (<6 chars) rejected
    const weakPassRes = await makeRequest('/api/auth/register', 'POST', {
      employeeId: `EMP-WEAK-${Date.now()}`,
      name: 'Weak Pass Tester',
      email: `weak.${Date.now()}@dayflow.com`,
      password: '123',
    });
    if (weakPassRes.status !== 400) {
      throw new Error(`Weak password was not rejected: ${weakPassRes.status}`);
    }
    console.log('   ✅ Weak password (<6 characters) rejected with 400 Bad Request.\n');

    // ==========================================
    // MODULE 2: EMAIL VERIFICATION
    // ==========================================
    console.log('📌 [MODULE 2] Email Verification Token Lifecycle...');

    // 2.1 Unverified account cannot log in
    const unverifiedLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: 'strongPassword123',
    });
    if (unverifiedLoginRes.status !== 403 || !unverifiedLoginRes.data.unverified) {
      throw new Error(
        `Unverified account was allowed to login: ${JSON.stringify(unverifiedLoginRes)}`
      );
    }
    console.log('   ✅ Unverified user login rejected with 403 Forbidden.');

    // 2.2 Invalid verification token rejected
    const badTokenRes = await makeRequest('/api/auth/verify-email', 'POST', {
      token: 'fake-invalid-token-12345',
    });
    if (badTokenRes.status !== 400) {
      throw new Error(`Invalid token was not rejected: ${badTokenRes.status}`);
    }
    console.log('   ✅ Invalid verification token rejected with 400 Bad Request.');

    // 2.3 Verification succeeds with genuine token
    const verifyRes = await makeRequest('/api/auth/verify-email', 'POST', {
      token: verificationToken,
    });
    if (verifyRes.status !== 200 || !verifyRes.data.success) {
      throw new Error(`Email verification failed: ${JSON.stringify(verifyRes)}`);
    }
    console.log('   ✅ Verification succeeded with valid token. Account is now active.');

    // 2.4 Verified account can now log in
    const verifiedLoginRes = await makeRequest('/api/auth/login', 'POST', {
      email: testEmail,
      password: 'strongPassword123',
    });
    if (verifiedLoginRes.status !== 200 || !verifiedLoginRes.data.token) {
      throw new Error(`Verified login failed: ${JSON.stringify(verifiedLoginRes)}`);
    }
    const newEmpToken = verifiedLoginRes.data.token;
    const newEmpUserId = verifiedLoginRes.data.user.id;
    console.log('   ✅ Verified user logged in successfully. JWT issued.');

    // 2.5 Verify seeded demo accounts remain functional
    const adminLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@dayflow.com',
      password: 'admin123',
    });
    if (adminLogin.status !== 200) throw new Error('Seeded Admin login failed');
    const adminToken = adminLogin.data.token;
    console.log('   ✅ Seeded Demo Admin (Priya Iyer) login verified.');

    const empLogin = await makeRequest('/api/auth/login', 'POST', {
      email: 'alex@dayflow.com',
      password: 'employee123',
    });
    if (empLogin.status !== 200) throw new Error('Seeded Employee login failed');
    const ananyaToken = empLogin.data.token;
    const ananyaUserId = empLogin.data.user.id;
    console.log('   ✅ Seeded Demo Employee (Ananya Sharma) login verified.\n');

    // ==========================================
    // MODULE 3: EMPLOYEE PROFILE DOCUMENTS & RBAC
    // ==========================================
    console.log('📌 [MODULE 3] Employee Dossier & Document Management...');

    // 3.1 Employee sees own documents
    const myDocsRes = await makeRequest(
      `/api/users/${newEmpUserId}/documents`,
      'GET',
      null,
      newEmpToken
    );
    if (myDocsRes.status !== 200 || !Array.isArray(myDocsRes.data.documents)) {
      throw new Error(`Failed to fetch employee documents: ${JSON.stringify(myDocsRes)}`);
    }
    console.log(`   ✅ Employee retrieved own documents (${myDocsRes.data.documents.length} files).`);

    // 3.2 Employee adds a new document
    const addDocRes = await makeRequest(
      `/api/users/${newEmpUserId}/documents`,
      'POST',
      {
        name: 'Aadhaar_Card_Aditya.pdf',
        type: 'Government ID',
        fileSize: '1.4 MB',
      },
      newEmpToken
    );
    if (addDocRes.status !== 201 || !addDocRes.data.document) {
      throw new Error(`Add document failed: ${JSON.stringify(addDocRes)}`);
    }
    const createdDocId = addDocRes.data.document._id;
    console.log('   ✅ Employee attached new document: Aadhaar_Card_Aditya.pdf.');

    // 3.3 Employee CANNOT view another employee's documents
    const crossDocRes = await makeRequest(
      `/api/users/${ananyaUserId}/documents`,
      'GET',
      null,
      newEmpToken
    );
    if (crossDocRes.status !== 403) {
      throw new Error(
        `Cross-employee document access was not blocked: ${crossDocRes.status}`
      );
    }
    console.log('   ✅ Unauthorized cross-employee document access blocked with 403 Forbidden.');

    // 3.4 Admin CAN view any employee's documents
    const adminViewDocs = await makeRequest(
      `/api/users/${newEmpUserId}/documents`,
      'GET',
      null,
      adminToken
    );
    if (adminViewDocs.status !== 200) {
      throw new Error(`Admin failed to view employee documents: ${adminViewDocs.status}`);
    }
    console.log('   ✅ Admin successfully retrieved employee documents.');

    // 3.5 Admin verifies employee document
    const verifyDocRes = await makeRequest(
      `/api/users/${newEmpUserId}/documents/${createdDocId}/status`,
      'PUT',
      { status: 'Verified' },
      adminToken
    );
    if (verifyDocRes.status !== 200 || verifyDocRes.data.document?.status !== 'Verified') {
      throw new Error(`Document verification failed: ${JSON.stringify(verifyDocRes)}`);
    }
    console.log('   ✅ Admin verified document status to "Verified".\n');

    // ==========================================
    // MODULE 4: AVATAR SELECTION & PROFILE EDITING
    // ==========================================
    console.log('📌 [MODULE 4] Avatar Selection & Profile Updates...');

    // 4.1 Employee changes avatar
    const newAvatarUri =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234f46e5"/><text x="50" y="58" font-size="32" font-family="sans-serif" text-anchor="middle" fill="white" font-weight="bold">AD</text></svg>';
    const avatarUpdateRes = await makeRequest(
      `/api/users/${newEmpUserId}`,
      'PUT',
      {
        avatar: newAvatarUri,
        phone: '+91 99887 76655',
        address: { city: 'Pune', state: 'Maharashtra', zip: '411001' },
      },
      newEmpToken
    );
    if (avatarUpdateRes.status !== 200 || avatarUpdateRes.data.employee.avatar !== newAvatarUri) {
      throw new Error(`Avatar update failed: ${JSON.stringify(avatarUpdateRes)}`);
    }
    console.log('   ✅ Employee updated profile picture, phone, and address.');

    // 4.2 Verify persistence in MongoDB
    const persistedUser = await User.findById(newEmpUserId);
    if (persistedUser.avatar !== newAvatarUri || persistedUser.phone !== '+91 99887 76655') {
      throw new Error('Avatar or phone was not persisted to MongoDB');
    }
    console.log('   ✅ Avatar and profile details persisted in MongoDB.\n');

    // ==========================================
    // MODULE 5: ADMIN EMPLOYEE SWITCHING
    // ==========================================
    console.log('📌 [MODULE 5] Admin Employee Directory & Context Switching...');

    // 5.1 Admin fetches all employees
    const adminDirectoryRes = await makeRequest('/api/users', 'GET', null, adminToken);
    if (adminDirectoryRes.status !== 200 || adminDirectoryRes.data.employees.length < 6) {
      throw new Error(`Admin directory fetch failed: ${JSON.stringify(adminDirectoryRes)}`);
    }
    console.log(
      `   ✅ Admin employee directory fetched (${adminDirectoryRes.data.employees.length} employees available for context switching).`
    );

    // 5.2 Employee blocked from Admin directory
    const empDirBlock = await makeRequest('/api/users', 'GET', null, newEmpToken);
    if (empDirBlock.status !== 403) {
      throw new Error(`Employee was not blocked from Admin directory: ${empDirBlock.status}`);
    }
    console.log('   ✅ Employee blocked from company directory with 403 Forbidden.');

    console.log('\n============================================================');
    console.log('🎉 ALL FINAL COMPLIANCE REQUIREMENTS PASSED WITH 100% SUCCESS! 🚀');
    console.log('============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Final compliance test error:', err.message);
    process.exit(1);
  }
}

runFinalComplianceTests();
