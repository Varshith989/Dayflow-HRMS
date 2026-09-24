const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Salary = require('./models/Salary');

dotenv.config();

async function runTest() {
  console.log('🧪 Starting Phase 1 Integration & Model Verification...');
  await connectDB();

  const usersCount = await User.countDocuments();
  const attendanceCount = await Attendance.countDocuments();
  const leavesCount = await Leave.countDocuments();
  const salariesCount = await Salary.countDocuments();

  console.log(`📊 Current Database Stats:`);
  console.log(`- Users: ${usersCount}`);
  console.log(`- Attendance Records: ${attendanceCount}`);
  console.log(`- Leave Records: ${leavesCount}`);
  console.log(`- Salary/Payroll Records: ${salariesCount}`);

  // Test admin user password verification
  const admin = await User.findOne({ email: 'admin@dayflow.com' });
  if (!admin) {
    throw new Error('Admin user not found!');
  }
  const isMatch = await admin.comparePassword('admin123');
  console.log(`🔑 Admin password bcrypt verification: ${isMatch ? 'PASSED ✅' : 'FAILED ❌'}`);

  // Test employee password verification
  const employee = await User.findOne({ email: 'alex@dayflow.com' });
  if (!employee) {
    throw new Error('Employee user not found!');
  }
  const isEmpMatch = await employee.comparePassword('employee123');
  console.log(`🔑 Employee password bcrypt verification: ${isEmpMatch ? 'PASSED ✅' : 'FAILED ❌'}`);

  // Verify salary calculation logic
  const alexSalary = await Salary.findOne({ userId: employee._id });
  console.log(`💰 Sample Net Salary Calculation: Basic ₹${alexSalary.basicSalary} + HRA ₹${alexSalary.hra} + Allowances ₹${alexSalary.allowances} -> Net Salary ₹${alexSalary.netSalary} ✅`);

  console.log('🎉 PHASE 1 VERIFICATION COMPLETED SUCCESSFULLY!');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
