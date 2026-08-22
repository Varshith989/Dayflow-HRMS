# WorkZen – Human Resource Management System

**Human Resource Management System – Odoo × NMIT Hackathon 2026**

> **Work smarter. Stay in sync.**

WorkZen is a full-stack Human Resource Management System (HRMS) designed to digitize, centralize, and streamline core workforce workflows — including employee management, attendance, leave, payroll, profile management, and compliance documents — through an intuitive role-based portal.

---

## 🏆 Hackathon Details

- **Event:** Odoo × NMIT Hackathon 2026
- **Project:** WorkZen HRMS
- **Repository:** https://github.com/vaishnavikp156/dayflow-hrms

---

## 💡 Why WorkZen?

Traditional HR workflows often rely on scattered spreadsheets, manual leave tracking, delayed payroll calculations, and disconnected employee records.

**WorkZen** brings these workflows together into one centralized platform.

### Key Benefits

1. **Employee Transparency**  
   Employees can view their attendance, leave balances, salary information, payslips, profile details, and compliance documents.

2. **HR Efficiency**  
   Admin/HR users can manage employees, attendance, leave approvals, salary structures, payroll, and employee records from one dashboard.

3. **Secure Role-Based Access**  
   JWT authentication and role-based authorization ensure that employees and administrators only access the information permitted for their role.

---

# 👥 User Roles & Access Control

| Feature | Employee | Admin / HR |
|---|:---:|:---:|
| Account Registration & Verification | ✅ | ✅ |
| Personal Dashboard | ✅ | — |
| Admin Dashboard | — | ✅ |
| Employee Directory | Own profile | All employees |
| Profile Management | Limited editing | Full editing |
| Profile Avatar | ✅ | ✅ |
| Employee Documents | Own documents | All documents |
| Attendance | Own attendance | All employees |
| Check-in / Check-out | ✅ | — |
| Leave Application | ✅ | — |
| Leave Approval | — | ✅ |
| Payroll View | Own payslips | All payroll |
| Salary Structure Updates | — | ✅ |
| Employee Switching | — | ✅ |
| Light / Dark Mode | ✅ | ✅ |

---

# ✨ Core Features

## 1. 🔐 Authentication & Authorization

- Employee and HR/Admin registration
- Employee ID, email, password, and role
- Password validation
- Password hashing using bcryptjs
- Email verification using a token-based demo flow
- JWT authentication
- Protected routes
- Role-based access control
- Incorrect credential error handling
- Quick Demo Login for hackathon evaluation

> The email verification flow is implemented without requiring an external SMTP service, making the application reliable for offline hackathon demonstrations.

---

## 2. 👤 Employee Profile Management

Employees can view:

- Personal details
- Job details
- Department
- Designation
- Contact information
- Address
- Salary information
- Documents
- Profile picture/avatar

Employees can edit permitted fields such as:

- Phone number
- Address
- Profile picture

Admin/HR users can manage employee information across the organization.

### Avatar System

WorkZen includes custom vector SVG avatars for demo employees.

The avatars are self-contained and do not depend on external image hosting.

---

## 3. 📄 Employee Documents & Verification

Employees can manage their own document dossier.

Supported document categories include:

- Government ID
- Address Proof
- Educational Certificate
- Experience Certificate
- Offer Letter
- Tax Declaration

Documents have verification statuses such as:

- Verified
- Pending Verification
- Rejected

Admin/HR users can review employee documents and update verification status.

---

## 4. 🕐 Attendance Management

### Employee

Employees can:

- Check in
- Check out
- View daily attendance
- View weekly attendance
- View working hours
- View attendance status

Supported statuses include:

- Present
- Absent
- Half-day
- Leave
- Weekend
- Upcoming

### Admin / HR

Admins can:

- View company-wide attendance
- Search employees
- Filter attendance
- View attendance records

Duplicate check-ins are prevented through validation.

---

## 5. 🌴 Leave & Time-Off Management

Employees can apply for:

- Paid Leave
- Sick Leave
- Unpaid Leave

They can:

- Select a date range
- Add remarks
- View leave balance
- Track request status
- View HR comments

Leave statuses:

- Pending
- Approved
- Rejected

### Admin / HR

Admins can:

- View all leave requests
- Approve requests
- Reject requests
- Add comments
- Manage leave balances

Approved leave automatically updates the employee's available balance.

---

## 6. 💰 Payroll & Salary Management

### Employee Payroll View

Employees can view their own salary information and payslips in read-only mode.

Payslips include:

- Basic Salary
- HRA
- Allowances
- Gross Earnings
- PF
- Professional Tax
- Other Deductions
- Unpaid Leave Deduction
- Net Salary
- Payment Status
- Pay Period

### Admin Payroll Control

Admin/HR users can:

- View payroll of all employees
- Generate payroll
- Update salary components
- Update payment status
- View salary structures
- Ensure payroll accuracy

Salary calculations are displayed in **Indian Rupees (₹ INR)**.

---

# 📊 Dashboards

## Employee Dashboard

The employee dashboard provides:

- Attendance summary
- Leave balance
- Latest salary information
- Quick access to Profile
- Quick access to Attendance
- Quick access to Leave Requests
- Quick access to Payslips
- 7-day attendance rhythm
- **Recent Activity & Alerts**

Recent Activity can reflect events such as:

- Attendance activity
- Leave submissions
- Leave approvals/rejections
- Payslip activity
- Document/compliance updates

---

## Admin / HR Dashboard

The Admin dashboard provides:

- Employee list
- Workforce overview
- Attendance records
- Leave approvals
- Payroll information
- Workforce statistics
- Department information
- Employee management

### Admin Employee Switcher

Admins can search for employees directly from the top navigation and quickly inspect employee context.

The switcher provides quick access to:

- Employee profile
- Attendance
- Leave information
- Salary information

Employees do not have access to this functionality.

---

# 🎨 UI / UX

WorkZen includes:

- Modern SaaS-style interface
- Responsive layout
- Light mode
- Dark mode
- Consistent cards and navigation
- Custom WorkZen branding
- Custom employee avatars
- Interactive modals
- Toast notifications
- Status badges
- Responsive dashboard components

### Branding

**WorkZen HRMS**

> **Work smarter. Stay in sync.**

---

# 🛠️ Technology Stack

## Frontend

- React 18
- Vite 6
- Tailwind CSS
- React Router
- Axios
- Lucide React Icons
- Framer Motion
- date-fns

## Backend

- Node.js
- Express.js
- REST APIs
- JWT
- bcryptjs
- CORS
- dotenv

## Database

- MongoDB
- Mongoose
- mongodb-memory-server (automatic fallback for zero-configuration, instant execution)

## Development

- Git
- GitHub
- Antigravity IDE

---

# 📁 Project Structure

```text
dayflow-hrms/
│
├── client/
│   ├── public/
│   │   ├── workzen-icon.svg
│   │   └── workzen-logo.svg
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── attendance/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── leave/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── employee/
│   │   └── utils/
│   │
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── test_*.js
│   │
│   ├── .env.example
│   └── package.json
│
├── package.json
├── .gitignore
└── README.md
```

---

# 🔑 Demo Accounts

The database is pre-seeded with realistic Indian enterprise personas for evaluation:

> **Note:** These accounts are seeded demo credentials specifically created for hackathon evaluation and demonstration.

### HR Administrator
- **Name:** Priya Iyer (HR Operations Lead)
- **Email:** `admin@dayflow.com`
- **Password:** `admin123`
- **Role:** `admin`

### Employees
1. **Ananya Sharma** (Senior Fullstack Developer)
   - **Email:** `alex@dayflow.com`
   - **Password:** `employee123`
2. **Rohan Nair** (Lead UI/UX Designer)
   - **Email:** `elena@dayflow.com`
   - **Password:** `employee123`
3. **Arjun Menon** (Director of Marketing)
   - **Email:** `marcus@dayflow.com`
   - **Password:** `employee123`
4. **Sneha Kulkarni** (Financial Controller)
   - **Email:** `sneha@dayflow.com`
   - **Password:** `employee123`
5. **Karthik Reddy** (Senior DevOps Specialist)
   - **Email:** `karthik@dayflow.com`
   - **Password:** `employee123`

---

# 🚀 How to Run the Project Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- *(Optional)* Local **MongoDB** instance (If MongoDB is not running locally, the server will automatically launch an embedded in-memory MongoDB database).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/vaishnavikp156/dayflow-hrms.git
cd dayflow-hrms
```

---

### Step 2: Set Up Backend Server
1. Navigate to the `server` directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file inside `server/` (or use defaults):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/dayflow_hrms
   JWT_SECRET=your_secure_jwt_secret_here
   ```

3. Seed initial demo data:
   ```bash
   npm run seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend will run on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

---

### Step 3: Set Up Frontend Client
1. Open a new terminal, navigate to the `client` directory, and install dependencies:
   ```bash
   cd client
   npm install
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`.*

---

### Step 4: Run Tests & Build Verification
- **Run Backend Verification Suites:**
   ```bash
   cd server
   node src/test_final_compliance.js
   ```
- **Run Frontend Production Build:**
   ```bash
   cd client
   npm run build
   ```

---

# 🔒 Security & Data Integrity Notes

- **Password Hashing:** All user passwords are encrypted using `bcryptjs` with salt rounds before database persistence.
- **Route Authorization:** Middleware validates authorization headers, rejecting unauthenticated requests with `401 Unauthorized` and cross-role requests with `403 Forbidden`.
- **Isolated Evaluation:** Email verification and document storage are implemented without external cloud dependencies to ensure the application runs reliably offline and across evaluation environments.

---

# 📄 License & Attribution

Developed for the **Odoo × NMIT Hackathon 2026**.  
Made with ❤️ in India.