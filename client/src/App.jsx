import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { EmployeeInspectionProvider } from './context/EmployeeInspectionContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeDirectoryPage from './pages/admin/EmployeeDirectoryPage';
import AllAttendancePage from './pages/admin/AllAttendancePage';
import LeaveApprovalPage from './pages/admin/LeaveApprovalPage';
import PayrollManagementPage from './pages/admin/PayrollManagementPage';
import EmployeeContextView from './pages/admin/EmployeeContextView';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendancePage from './pages/employee/MyAttendancePage';
import MyLeavesPage from './pages/employee/MyLeavesPage';
import MySalaryPage from './pages/employee/MySalaryPage';

// Root redirect handler based on authentication status & role
const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user?.role === 'admin' ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/employee" replace />
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <EmployeeInspectionProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Admin Role Protected Routes with Shared Layout */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route element={<AppLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/employees" element={<EmployeeDirectoryPage />} />
                    <Route path="/admin/attendance" element={<AllAttendancePage />} />
                    <Route path="/admin/leaves" element={<LeaveApprovalPage />} />
                    <Route path="/admin/payroll" element={<PayrollManagementPage />} />
                    <Route path="/admin/profile" element={<ProfilePage />} />
                    <Route path="/admin/employee-view" element={<EmployeeContextView />} />
                  </Route>
                </Route>

                {/* Employee Role Protected Routes with Shared Layout */}
                <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
                  <Route element={<AppLayout />}>
                    <Route path="/employee" element={<EmployeeDashboard />} />
                    <Route path="/employee/attendance" element={<MyAttendancePage />} />
                    <Route path="/employee/leaves" element={<MyLeavesPage />} />
                    <Route path="/employee/salary" element={<MySalaryPage />} />
                    <Route path="/employee/profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Index and fallback redirects */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </EmployeeInspectionProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
