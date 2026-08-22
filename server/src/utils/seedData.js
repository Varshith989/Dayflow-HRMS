const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Salary = require('../models/Salary');
const { format, subDays } = require('date-fns');

dotenv.config();

const seedDatabase = async (disconnectWhenDone = true) => {
  try {
    console.log('🧹 Purging existing collections for clean seed...');
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Salary.deleteMany({});

    console.log('👤 Creating demo Admin and Employee users...');
    const usersToCreate = [
      {
        employeeId: 'EMP-001',
        name: 'Sarah Jenkins',
        email: 'admin@dayflow.com',
        password: 'admin123',
        role: 'admin',
        department: 'Human Resources',
        designation: 'HR Director & People Ops Lead',
        phone: '+91 98765 43210',
        joiningDate: new Date('2023-01-10'),
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
        status: 'Active',
        address: {
          street: '42 Orchid Boulevard, Silicon Valley Tech Zone',
          city: 'Bangalore',
          state: 'Karnataka',
          zip: '560064',
        },
        emergencyContact: {
          name: 'David Jenkins',
          relation: 'Spouse',
          phone: '+91 98765 43219',
        },
        leaveBalance: { paid: 18, sick: 10, unpaid: 0 },
      },
      {
        employeeId: 'EMP-002',
        name: 'Alex Rivera',
        email: 'alex@dayflow.com',
        password: 'employee123',
        role: 'employee',
        department: 'Engineering',
        designation: 'Senior Full-Stack Engineer',
        phone: '+91 98112 34567',
        joiningDate: new Date('2023-06-15'),
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
        status: 'Active',
        address: {
          street: '15 Green Meadows, Koramangala 4th Block',
          city: 'Bangalore',
          state: 'Karnataka',
          zip: '560034',
        },
        emergencyContact: {
          name: 'Maria Rivera',
          relation: 'Mother',
          phone: '+91 98112 34569',
        },
        leaveBalance: { paid: 14, sick: 7, unpaid: 0 },
      },
      {
        employeeId: 'EMP-003',
        name: 'Elena Rostova',
        email: 'elena@dayflow.com',
        password: 'employee123',
        role: 'employee',
        department: 'Product Design',
        designation: 'Lead UI/UX Designer',
        phone: '+91 98223 45678',
        joiningDate: new Date('2023-09-01'),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        status: 'Active',
        address: {
          street: '88 Indiranagar 100ft Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zip: '560038',
        },
        emergencyContact: {
          name: 'Ivan Rostov',
          relation: 'Brother',
          phone: '+91 98223 45670',
        },
        leaveBalance: { paid: 11, sick: 6, unpaid: 0 },
      },
      {
        employeeId: 'EMP-004',
        name: 'Marcus Vance',
        email: 'marcus@dayflow.com',
        password: 'employee123',
        role: 'employee',
        department: 'Sales & Marketing',
        designation: 'Growth Marketing Manager',
        phone: '+91 98334 56789',
        joiningDate: new Date('2024-02-01'),
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
        status: 'Active',
        address: {
          street: '102 Palm Residency, HSR Layout Sector 2',
          city: 'Bangalore',
          state: 'Karnataka',
          zip: '560102',
        },
        emergencyContact: {
          name: 'Clara Vance',
          relation: 'Sister',
          phone: '+91 98334 56780',
        },
        leaveBalance: { paid: 15, sick: 8, unpaid: 0 },
      },
    ];

    const createdUsers = [];
    for (const u of usersToCreate) {
      const userDoc = new User(u);
      await userDoc.save();
      createdUsers.push(userDoc);
    }

    const [adminUser, alex, elena, marcus] = createdUsers;

    console.log('📅 Generating realistic attendance history for the past 7 days...');
    const attendanceRecords = [];
    const today = new Date();

    for (let i = 0; i <= 6; i++) {
      const targetDate = subDays(today, i);
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;

      if (!isWeekend) {
        // Attendance for Alex
        attendanceRecords.push({
          userId: alex._id,
          date: dateStr,
          checkIn: new Date(`${dateStr}T09:12:00.000Z`),
          checkOut: i === 0 ? null : new Date(`${dateStr}T17:45:00.000Z`),
          totalHours: i === 0 ? 0 : 8.5,
          status: 'Present',
          workMode: i % 2 === 0 ? 'Office' : 'Remote',
          remarks: i === 0 ? 'Checked in on time' : 'Completed sprint planning and feature work',
        });

        // Attendance for Elena
        attendanceRecords.push({
          userId: elena._id,
          date: dateStr,
          checkIn: new Date(`${dateStr}T09:30:00.000Z`),
          checkOut: i === 0 ? null : new Date(`${dateStr}T18:00:00.000Z`),
          totalHours: i === 0 ? 0 : 8.5,
          status: 'Present',
          workMode: 'Office',
          remarks: 'Design system refinements',
        });

        // Attendance for Marcus
        if (i === 3) {
          // Half day
          attendanceRecords.push({
            userId: marcus._id,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:00:00.000Z`),
            checkOut: new Date(`${dateStr}T13:30:00.000Z`),
            totalHours: 4.5,
            status: 'Half-day',
            workMode: 'Office',
            remarks: 'Half day for medical checkup',
          });
        } else {
          attendanceRecords.push({
            userId: marcus._id,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:05:00.000Z`),
            checkOut: i === 0 ? null : new Date(`${dateStr}T17:35:00.000Z`),
            totalHours: i === 0 ? 0 : 8.5,
            status: 'Present',
            workMode: 'Office',
            remarks: 'Client demo calls & campaign launch',
          });
        }

        // Attendance for Admin (Sarah)
        attendanceRecords.push({
          userId: adminUser._id,
          date: dateStr,
          checkIn: new Date(`${dateStr}T08:50:00.000Z`),
          checkOut: i === 0 ? null : new Date(`${dateStr}T17:30:00.000Z`),
          totalHours: i === 0 ? 0 : 8.6,
          status: 'Present',
          workMode: 'Office',
          remarks: 'HR operations and team reviews',
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);

    console.log('📝 Generating sample leave applications...');
    const leaveRecords = [
      {
        userId: alex._id,
        leaveType: 'Paid',
        startDate: format(subDays(today, -2), 'yyyy-MM-dd'),
        endDate: format(subDays(today, -3), 'yyyy-MM-dd'),
        daysCount: 2,
        reason: 'Attending National Hackathon Finals & Tech Showcase',
        status: 'Pending',
        adminComment: '',
      },
      {
        userId: elena._id,
        leaveType: 'Sick',
        startDate: format(subDays(today, 5), 'yyyy-MM-dd'),
        endDate: format(subDays(today, 5), 'yyyy-MM-dd'),
        daysCount: 1,
        reason: 'Viral fever and prescribed rest',
        status: 'Approved',
        adminComment: 'Approved. Take sufficient rest and get well soon!',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(subDays(today, 5)),
      },
      {
        userId: marcus._id,
        leaveType: 'Paid',
        startDate: format(subDays(today, 10), 'yyyy-MM-dd'),
        endDate: format(subDays(today, 8), 'yyyy-MM-dd'),
        daysCount: 3,
        reason: 'Family holiday trip to Goa',
        status: 'Approved',
        adminComment: 'Approved. Enjoy your vacation!',
        reviewedBy: adminUser._id,
        reviewedAt: new Date(subDays(today, 11)),
      },
    ];

    await Leave.insertMany(leaveRecords);

    console.log('💰 Generating salary and payroll structures...');
    const salaryRecords = [
      // Alex Rivera (Senior Engineer)
      {
        userId: alex._id,
        month: 8,
        year: 2026,
        basicSalary: 75000,
        hra: 25000,
        allowances: 15000,
        deductions: { tax: 9000, pf: 4500, unpaidLeaveDeduction: 0, other: 500 },
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary',
      },
      {
        userId: alex._id,
        month: 7,
        year: 2026,
        basicSalary: 75000,
        hra: 25000,
        allowances: 15000,
        deductions: { tax: 9000, pf: 4500, unpaidLeaveDeduction: 0, other: 500 },
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-07-31'),
        remarks: 'July 2026 Salary',
      },
      // Elena Rostova (Lead Designer)
      {
        userId: elena._id,
        month: 8,
        year: 2026,
        basicSalary: 65000,
        hra: 22000,
        allowances: 12000,
        deductions: { tax: 7500, pf: 3800, unpaidLeaveDeduction: 0, other: 0 },
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary',
      },
      // Marcus Vance (Growth Marketing)
      {
        userId: marcus._id,
        month: 8,
        year: 2026,
        basicSalary: 55000,
        hra: 18000,
        allowances: 10000,
        deductions: { tax: 6000, pf: 3000, unpaidLeaveDeduction: 0, other: 0 },
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary',
      },
      // Sarah Jenkins (HR Director)
      {
        userId: adminUser._id,
        month: 8,
        year: 2026,
        basicSalary: 90000,
        hra: 30000,
        allowances: 20000,
        deductions: { tax: 12000, pf: 5000, unpaidLeaveDeduction: 0, other: 0 },
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary',
      },
    ];

    for (const sal of salaryRecords) {
      const salDoc = new Salary(sal);
      await salDoc.save();
    }

    console.log('✅ Dayflow HRMS Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 DEMO CREDENTIALS:');
    console.log('👑 Admin/HR : admin@dayflow.com / admin123');
    console.log('🧑 Employee : alex@dayflow.com  / employee123');
    console.log('🧑 Employee : elena@dayflow.com / employee123');
    console.log('🧑 Employee : marcus@dayflow.com / employee123');
    console.log('----------------------------------------------------');

    if (disconnectWhenDone) {
      await mongoose.disconnect();
      console.log('🔌 Database disconnected.');
    }
  } catch (error) {
    console.error(`❌ Error seeding database: ${error.message}`);
    if (disconnectWhenDone) process.exit(1);
  }
};

// If run directly via `node src/utils/seedData.js`
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dayflow_hrms';
  mongoose.connect(mongoUri)
    .then(() => seedDatabase(true))
    .catch((err) => {
      console.error(`Could not connect to MongoDB for manual seed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
