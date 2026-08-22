# Dayflow – Human Resource Management System

**Human Resource Management System – Odoo x NMIT Hackathon**

> **Every workday, perfectly aligned.**

Dayflow is a modern Human Resource Management System designed to digitize and streamline core HR operations such as employee management, attendance tracking, leave management, payroll visibility, and approval workflows.

The system provides separate role-based experiences for **Admin/HR** and **Employees**, allowing organizations to manage their workforce efficiently while giving employees convenient access to their own HR information.

---

## 🚀 Key Features

### 👑 Admin / HR

* Secure Admin/HR authentication
* Role-based access control
* Employee directory
* Search and filter employees
* Add and onboard employees
* Edit employee information
* Activate/deactivate employee accounts
* View employee profiles
* View company-wide attendance
* Filter attendance by date, department, and employee
* Attendance regularization
* View all leave requests
* Approve or reject leave requests
* Add HR comments to leave decisions
* Automatic leave-balance adjustment
* Company-wide payroll management
* Generate monthly payslips
* Update salary structures
* View payroll statistics
* Workforce and attendance analytics

### 🧑‍💻 Employee

* Secure employee authentication
* Personal dashboard
* Personal profile management
* Edit permitted contact and address information
* Check-in / Check-out
* Office / Remote work mode
* Live working-hours timer
* Daily attendance history
* Weekly attendance calendar
* Attendance status tracking
* Apply for Paid, Sick, or Unpaid Leave
* Leave balance tracking
* Leave request history
* View approval/rejection status
* View HR comments
* View personal salary information
* Digital payslip
* Salary breakdown and deductions
* Quick access to frequently used HR actions

---

## 🔐 Authentication & Security

Dayflow uses role-based access control to ensure that users can only access the features permitted for their role.

### Authentication

* JWT-based authentication
* Password hashing using bcrypt
* Protected API routes
* Protected frontend routes
* Role-based authorization
* Admin/HR and Employee permissions
* Unauthorized requests return appropriate `401` / `403` responses

Employees can access their own HR information, while Admin/HR users have organization-wide management privileges.

---

## 📊 Attendance Management

Dayflow provides interactive attendance tracking with:

* Check-in and Check-out
* Automatic timestamp recording
* Working-hours calculation
* Office / Remote work mode
* Daily attendance history
* Weekly attendance calendar
* Present / Absent / Half-day / Leave statuses
* Duplicate punch prevention
* Admin attendance roll-call
* Attendance filtering and search
* Admin attendance regularization

---

## 🏖️ Leave & Time-Off Management

Employees can apply for:

* Paid Leave
* Sick Leave
* Unpaid Leave

The system provides:

* Automatic leave-duration calculation
* Leave balance validation
* Date validation
* Overlapping-request prevention
* Pending / Approved / Rejected statuses
* Employee leave history
* Admin approval/rejection workflow
* HR comments
* Automatic leave-balance deduction after approval
* Protection against duplicate balance deduction

---

## 💰 Payroll & Salary Management

### Employee

Employees can view their own digital payslips containing:

* Basic Salary
* HRA
* Allowances
* Gross Earnings
* PF
* Tax / TDS
* Unpaid Leave Deductions
* Total Deductions
* Net Salary
* Payment Status
* Pay Period

### Admin / HR

Admins can:

* View company payroll
* Search and filter payroll records
* Generate monthly salary records
* Update salary components
* Automatically recalculate gross and net salary
* View employee payslips
* Track payment status

Employees cannot modify salary information or access organization-wide payroll.

---

## 📈 Dashboard & Analytics

### Admin Dashboard

Provides an overview of:

* Total workforce
* Present employees
* Pending leave approvals
* Payroll volume
* Department-wise workforce distribution
* Attendance status breakdown
* Live attendance activity
* Quick leave approval actions

### Employee Dashboard

Provides:

* Current work status
* Attendance summary
* Weekly attendance rhythm
* Leave balances
* Pending leave requests
* Latest salary information
* Quick actions for Profile, Attendance, Time Off, and Payslips

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* Lucide Icons
* Framer Motion

### Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcryptjs

### Database

* MongoDB
* Mongoose

### Development

* Git
* GitHub
* Antigravity IDE

---

## 📁 Project Structure

```text
dayflow-hrms/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   │       ├── admin/
│   │       └── employee/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
│
├── package.json
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/vaishnavikp156/dayflow-hrms.git
cd dayflow-hrms
```

### 2. Install dependencies

```bash
npm install
```

Install client dependencies:

```bash
cd client
npm install
cd ..
```

Install server dependencies:

```bash
cd server
npm install
cd ..
```

### 3. Configure environment variables

Create:

```text
server/.env
```

using the provided:

```text
server/.env.example
```

Add the required MongoDB and JWT configuration values.

**Do not commit `.env` files or secret credentials to GitHub.**

### 4. Start the application

From the root directory:

```bash
npm run dev
```

The application runs with:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## 🔑 Demo Accounts

### HR Admin

```text
Email: admin@dayflow.com
Password: admin123
```

### Employee – Alex Rivera

```text
Email: alex@dayflow.com
Password: employee123
```

### Employee – Elena Rostova

```text
Email: elena@dayflow.com
Password: employee123
```

### Employee – Marcus Vance

```text
Email: marcus@dayflow.com
Password: employee123
```

These accounts are provided as seeded demo accounts for hackathon evaluation.

---

## 🧪 Testing

Dayflow includes automated verification suites covering the major modules:

```text
test_phase1.js → Database & seed verification
test_phase2.js → Authentication & RBAC
test_phase3.js → Employee & profile management
test_phase4.js → Attendance
test_phase5.js → Leave management
test_phase6.js → Payroll
test_phase7.js → End-to-end regression testing
```

The final regression suite verifies the major HR workflows including:

* Authentication
* Role-based access
* Employee onboarding
* Profile updates
* Attendance check-in/check-out
* Leave application and approval
* Payroll generation
* Employee payroll access restrictions

The frontend production build was also verified successfully.

---

## 🎯 Project Objective

The objective of Dayflow is to provide a centralized HR platform that simplifies workforce management by bringing employee information, attendance, leave, payroll, and approval workflows into one secure and easy-to-use system.

---

## 🏆 Hackathon

**Event:** Odoo x NMIT Hackathon

**Project:** Dayflow – Human Resource Management System

**Repository:**
https://github.com/vaishnavikp156/dayflow-hrms

---

## 👥 User Roles

| Role       | Access                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------ |
| Admin / HR | Workforce management, attendance oversight, leave approvals, payroll management, analytics |
| Employee   | Personal profile, attendance, leave applications, salary/payslips                          |

---

## 🔒 Security Note

This repository contains demo credentials intended for hackathon evaluation.

Production deployments should use:

* Strong unique passwords
* Secure JWT secrets
* Environment variables
* Proper MongoDB access controls
* HTTPS
* Secure production authentication configuration

Never commit real credentials, API keys, database passwords, or `.env` files to the repository.

---

## 🌟 Dayflow

**Every workday, perfectly aligned.**
