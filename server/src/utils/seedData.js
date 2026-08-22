const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Salary = require('../models/Salary');
const demoAvatars = require('./avatars');
const { format, subDays } = require('date-fns');

dotenv.config();

const seedDatabase = async (disconnectWhenDone = true) => {
  try {
    console.log('🧹 Purging existing collections for clean seed...');
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Salary.deleteMany({});

    console.log('👤 Creating demo Indian Admin and Employee users...');
    const usersToCreate = [
      {
        employeeId: 'EMP-001',
        name: 'Priya Iyer',
        email: 'admin@dayflow.com',
        password: 'admin123',
        role: 'admin',
        department: 'Human Resources',
        designation: 'HR Manager & People Ops Lead',
        phone: '+91 98450 12345',
        joiningDate: new Date('2023-01-10'),
        avatar: demoAvatars.priya,
        status: 'Active',
        address: {
          street: '12th Main, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560038',
        },
        emergencyContact: {
          name: 'Venkatesh Iyer',
          relation: 'Spouse',
          phone: '+91 98450 12349',
        },
        leaveBalance: { paid: 18, sick: 10, unpaid: 0 },
      },
      {
        employeeId: 'EMP-002',
        name: 'Ananya Sharma',
        email: 'alex@dayflow.com',
        password: 'employee123',
        role: 'employee',
        department: 'Engineering',
        designation: 'Senior Fullstack Engineer',
        phone: '+91 98860 23456',
        joiningDate: new Date('2023-03-15'),
        avatar: demoAvatars.ananya,
        status: 'Active',
        address: {
          street: '15 Green Meadows, Koramangala 4th Block',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560034',
        },
        emergencyContact: {
          name: 'Sunita Sharma',
          relation: 'Mother',
          phone: '+91 98860 23459',
        },
        leaveBalance: { paid: 14, sick: 7, unpaid: 0 },
      },
      {
        employeeId: 'EMP-003',
        name: 'Rohan Nair',
        email: 'elena@dayflow.com',
        password: 'employee123',
        role: 'employee',
        department: 'Product Design',
        designation: 'Lead UI/UX Designer',
        phone: '+91 97410 34567',
        joiningDate: new Date('2023-06-01'),
        avatar: demoAvatars.rohan,
        status: 'Active',
        address: {
          street: '45 Palm Avenue, HSR Layout Sector 1',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560102',
        },
        emergencyContact: {
          name: 'Madhavan Nair',
          relation: 'Father',
          phone: '+91 97410 34560',
        },
        leaveBalance: { paid: 12, sick: 6, unpaid: 0 },
      },
      {
        employeeId: 'EMP-004',
        name: 'Arjun Menon',
        email: 'marcus@dayflow.com',
        password: 'employee123',
        role: 'employee',
        department: 'Sales & Marketing',
        designation: 'Marketing Director',
        phone: '+91 99000 45678',
        joiningDate: new Date('2022-11-10'),
        avatar: demoAvatars.arjun,
        status: 'Active',
        address: {
          street: '202 Marine Lines, Nariman Point',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400021',
        },
        emergencyContact: {
          name: 'Deepa Menon',
          relation: 'Spouse',
          phone: '+91 99000 45670',
        },
        leaveBalance: { paid: 15, sick: 8, unpaid: 0 },
      },
      {
        employeeId: 'EMP-005',
        name: 'Sneha Kulkarni',
        email: 'sneha@dayflow.com',
        password: 'employee123',
        role: 'employee',
        department: 'Finance',
        designation: 'Financial Controller',
        phone: '+91 98230 56789',
        joiningDate: new Date('2023-01-20'),
        avatar: demoAvatars.sneha,
        status: 'Active',
        address: {
          street: '14 FC Road, Shivaji Nagar',
          city: 'Pune',
          state: 'Maharashtra',
          zip: '411005',
        },
        emergencyContact: {
          name: 'Rajesh Kulkarni',
          relation: 'Brother',
          phone: '+91 98230 56780',
        },
        leaveBalance: { paid: 16, sick: 9, unpaid: 0 },
      },
      {
        employeeId: 'EMP-006',
        name: 'Karthik Reddy',
        email: 'karthik@dayflow.com',
        password: 'employee123',
        role: 'employee',
        department: 'Engineering',
        designation: 'DevOps & Cloud Engineer',
        phone: '+91 98490 67890',
        joiningDate: new Date('2023-08-01'),
        avatar: demoAvatars.karthik,
        status: 'Active',
        address: {
          street: '78 HITEC City Main Road, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          zip: '500081',
        },
        emergencyContact: {
          name: 'Anil Reddy',
          relation: 'Father',
          phone: '+91 98490 67899',
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

    const [priya, ananya, rohan, arjun, sneha, karthik] = createdUsers;

    console.log('📅 Generating realistic attendance history for the past 7 days...');
    const attendanceRecords = [];
    const today = new Date();

    for (let i = 0; i <= 6; i++) {
      const targetDate = subDays(today, i);
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;

      if (!isWeekend) {
        // Attendance for Ananya (Engineering)
        attendanceRecords.push({
          userId: ananya._id,
          date: dateStr,
          checkIn: new Date(`${dateStr}T09:12:00.000Z`),
          checkOut: i === 0 ? null : new Date(`${dateStr}T17:45:00.000Z`),
          totalHours: i === 0 ? 0 : 8.5,
          status: 'Present',
          workMode: i % 2 === 0 ? 'Office' : 'Remote',
          remarks: i === 0 ? 'Checked in on time' : 'Sprint planning and core HRMS features',
        });

        // Attendance for Rohan (Design)
        attendanceRecords.push({
          userId: rohan._id,
          date: dateStr,
          checkIn: new Date(`${dateStr}T09:30:00.000Z`),
          checkOut: i === 0 ? null : new Date(`${dateStr}T18:00:00.000Z`),
          totalHours: i === 0 ? 0 : 8.5,
          status: 'Present',
          workMode: 'Office',
          remarks: 'UI/UX design system refinements & dark theme',
        });

        // Attendance for Arjun (Marketing)
        if (i === 3) {
          attendanceRecords.push({
            userId: arjun._id,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:00:00.000Z`),
            checkOut: new Date(`${dateStr}T13:30:00.000Z`),
            totalHours: 4.5,
            status: 'Half-day',
            workMode: 'Office',
            remarks: 'Half day for medical appointment',
          });
        } else {
          attendanceRecords.push({
            userId: arjun._id,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:05:00.000Z`),
            checkOut: i === 0 ? null : new Date(`${dateStr}T17:35:00.000Z`),
            totalHours: i === 0 ? 0 : 8.5,
            status: 'Present',
            workMode: 'Office',
            remarks: 'Client demo calls and hackathon campaign launch',
          });
        }

        // Attendance for Sneha (Finance)
        attendanceRecords.push({
          userId: sneha._id,
          date: dateStr,
          checkIn: new Date(`${dateStr}T09:15:00.000Z`),
          checkOut: i === 0 ? null : new Date(`${dateStr}T17:45:00.000Z`),
          totalHours: i === 0 ? 0 : 8.5,
          status: 'Present',
          workMode: 'Office',
          remarks: 'Monthly payroll disbursement auditing',
        });

        // Attendance for Karthik (DevOps)
        attendanceRecords.push({
          userId: karthik._id,
          date: dateStr,
          checkIn: new Date(`${dateStr}T09:00:00.000Z`),
          checkOut: i === 0 ? null : new Date(`${dateStr}T18:15:00.000Z`),
          totalHours: i === 0 ? 0 : 9.2,
          status: 'Present',
          workMode: 'Remote',
          remarks: 'Cloud cluster monitoring & health checks',
        });

        // Attendance for Priya (Admin)
        attendanceRecords.push({
          userId: priya._id,
          date: dateStr,
          checkIn: new Date(`${dateStr}T08:50:00.000Z`),
          checkOut: i === 0 ? null : new Date(`${dateStr}T17:30:00.000Z`),
          totalHours: i === 0 ? 0 : 8.6,
          status: 'Present',
          workMode: 'Office',
          remarks: 'HR operations, interviews & team performance reviews',
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);

    console.log('📝 Generating sample leave applications...');
    const leaveRecords = [
      {
        userId: ananya._id,
        leaveType: 'Paid',
        startDate: format(subDays(today, -2), 'yyyy-MM-dd'),
        endDate: format(subDays(today, -3), 'yyyy-MM-dd'),
        daysCount: 2,
        reason: 'Attending Odoo x NMIT National Hackathon Showcase',
        status: 'Pending',
        adminComment: '',
      },
      {
        userId: rohan._id,
        leaveType: 'Sick',
        startDate: format(subDays(today, 5), 'yyyy-MM-dd'),
        endDate: format(subDays(today, 5), 'yyyy-MM-dd'),
        daysCount: 1,
        reason: 'Viral fever and prescribed medical rest',
        status: 'Approved',
        adminComment: 'Approved. Take sufficient rest and get well soon!',
        reviewedBy: priya._id,
        reviewedAt: new Date(subDays(today, 5)),
      },
      {
        userId: arjun._id,
        leaveType: 'Paid',
        startDate: format(subDays(today, 10), 'yyyy-MM-dd'),
        endDate: format(subDays(today, 8), 'yyyy-MM-dd'),
        daysCount: 3,
        reason: 'Family trip to Ooty & Coorg',
        status: 'Approved',
        adminComment: 'Approved. Enjoy your vacation!',
        reviewedBy: priya._id,
        reviewedAt: new Date(subDays(today, 11)),
      },
    ];

    await Leave.insertMany(leaveRecords);

    console.log('💰 Generating realistic Indian salary structures (INR)...');
    const salaryRecords = [
      // Ananya Sharma (Senior Fullstack Developer)
      {
        userId: ananya._id,
        month: 8,
        year: 2026,
        basicSalary: 70000,
        hra: 28000,
        allowances: 18000,
        deductions: { tax: 7800, pf: 4200, unpaidLeaveDeduction: 0, other: 0 },
        grossSalary: 116000,
        netSalary: 104000,
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary — Regular Disbursement',
      },
      {
        userId: ananya._id,
        month: 7,
        year: 2026,
        basicSalary: 70000,
        hra: 28000,
        allowances: 18000,
        deductions: { tax: 7800, pf: 4200, unpaidLeaveDeduction: 0, other: 0 },
        grossSalary: 116000,
        netSalary: 104000,
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-07-31'),
        remarks: 'July 2026 Salary',
      },
      // Rohan Nair (Lead UI/UX Designer)
      {
        userId: rohan._id,
        month: 8,
        year: 2026,
        basicSalary: 60000,
        hra: 24000,
        allowances: 14000,
        deductions: { tax: 5400, pf: 3600, unpaidLeaveDeduction: 0, other: 0 },
        grossSalary: 98000,
        netSalary: 89000,
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary',
      },
      // Arjun Menon (Marketing Director)
      {
        userId: arjun._id,
        month: 8,
        year: 2026,
        basicSalary: 75000,
        hra: 30000,
        allowances: 20000,
        deductions: { tax: 8500, pf: 4500, unpaidLeaveDeduction: 0, other: 0 },
        grossSalary: 125000,
        netSalary: 112000,
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary',
      },
      // Sneha Kulkarni (Financial Controller)
      {
        userId: sneha._id,
        month: 8,
        year: 2026,
        basicSalary: 65000,
        hra: 26000,
        allowances: 15000,
        deductions: { tax: 6100, pf: 3900, unpaidLeaveDeduction: 0, other: 0 },
        grossSalary: 106000,
        netSalary: 96000,
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary',
      },
      // Karthik Reddy (DevOps & Cloud Engineer)
      {
        userId: karthik._id,
        month: 8,
        year: 2026,
        basicSalary: 68000,
        hra: 27200,
        allowances: 16800,
        deductions: { tax: 6920, pf: 4080, unpaidLeaveDeduction: 0, other: 0 },
        grossSalary: 112000,
        netSalary: 101000,
        paymentStatus: 'Paid',
        paymentDate: new Date('2026-08-31'),
        remarks: 'August 2026 Salary',
      },
      // Priya Iyer (HR Manager)
      {
        userId: priya._id,
        month: 8,
        year: 2026,
        basicSalary: 80000,
        hra: 32000,
        allowances: 22000,
        deductions: { tax: 9200, pf: 4800, unpaidLeaveDeduction: 0, other: 0 },
        grossSalary: 134000,
        netSalary: 120000,
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
    console.log('👑 Admin/HR : admin@dayflow.com / admin123 (Priya Iyer - HR Manager)');
    console.log('🧑 Employee : alex@dayflow.com  / employee123 (Ananya Sharma - Senior Dev)');
    console.log('🧑 Employee : elena@dayflow.com / employee123 (Rohan Nair - Lead UI/UX)');
    console.log('🧑 Employee : marcus@dayflow.com / employee123 (Arjun Menon - Marketing Dir)');
    console.log('🧑 Employee : sneha@dayflow.com / employee123 (Sneha Kulkarni - Finance)');
    console.log('🧑 Employee : karthik@dayflow.com / employee123 (Karthik Reddy - DevOps)');
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
