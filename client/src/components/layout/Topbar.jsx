import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Clock,
  Search,
  Bell,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';
import AdminEmployeeSwitcher from '../admin/AdminEmployeeSwitcher';

export const Topbar = ({ onMenuClick, onOpenCommandPalette }) => {
  const { user, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const parts = [{ label: 'Dayflow', to: isAdmin ? '/admin' : '/employee' }];

    if (path === '/admin') {
      parts.push({ label: 'Admin Dashboard', to: '/admin' });
    } else if (path === '/employee') {
      parts.push({ label: 'Employee Dashboard', to: '/employee' });
    } else if (path.includes('/employees')) {
      parts.push({ label: 'Workforce', to: '/admin/employees' });
      parts.push({ label: 'Directory', to: '/admin/employees' });
    } else if (path.includes('/attendance')) {
      parts.push({ label: 'Attendance', to: path });
      parts.push({ label: isAdmin ? 'Roll Call' : 'My Logs', to: path });
    } else if (path.includes('/leaves')) {
      parts.push({ label: 'Time Off', to: path });
      parts.push({ label: isAdmin ? 'Approvals' : 'My Requests', to: path });
    } else if (path.includes('/payroll') || path.includes('/salary')) {
      parts.push({ label: 'Payroll', to: path });
      parts.push({ label: isAdmin ? 'Management' : 'My Payslips', to: path });
    } else if (path.includes('/employee-view')) {
      parts.push({ label: 'Workforce', to: '/admin/employees' });
      parts.push({ label: 'Employee 360 Inspection', to: path });
    } else if (path.includes('/profile')) {
      parts.push({ label: 'Account', to: path });
      parts.push({ label: 'Profile', to: path });
    }
    return parts;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between transition-colors duration-150">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Enterprise Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${crumb.label}-${i}`}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />}
                {isLast ? (
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Command palette, Switcher, Clock, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-slate-500 dark:text-slate-400">Search or jump to...</span>
          <kbd className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Search (Cmd+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Admin Employee Switcher */}
        {isAdmin && <AdminEmployeeSwitcher />}

        {/* Tabular Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-400 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{format(currentTime, 'EEE, dd MMM • HH:mm:ss')}</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-dropdown p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">Activity & Alerts</span>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">
                      August 2026 Payroll Verified
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Disbursement batch completed.</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">
                      Daily Attendance Feed Live
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">All staff punches synced.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* User Avatar */}
        <Link
          to={isAdmin ? '/admin/profile' : '/employee/profile'}
          className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Account Profile"
        >
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-7 h-7 rounded-md object-cover border border-slate-200 dark:border-slate-700"
          />
          <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
            {user?.name?.split(' ')[0]}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
