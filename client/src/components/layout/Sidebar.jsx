import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserCircle,
  LogOut,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out of Dayflow');
    navigate('/login');
  };

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Employee Directory', path: '/admin/employees', icon: Users },
    { label: 'All Attendance', path: '/admin/attendance', icon: Clock },
    { label: 'Time Off Approvals', path: '/admin/leaves', icon: CalendarDays },
    { label: 'Payroll Management', path: '/admin/payroll', icon: DollarSign },
    { label: 'My Profile', path: '/admin/profile', icon: UserCircle },
  ];

  const employeeNavItems = [
    { label: 'Dashboard', path: '/employee', icon: LayoutDashboard, exact: true },
    { label: 'My Attendance', path: '/employee/attendance', icon: Clock },
    { label: 'My Time Off', path: '/employee/leaves', icon: CalendarDays },
    { label: 'My Payslips', path: '/employee/salary', icon: DollarSign },
    { label: 'My Profile', path: '/employee/profile', icon: UserCircle },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Dayflow</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/25">
                    HRMS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isAdmin ? 'Admin Operations' : 'Employee Workspace'}
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.designation || (isAdmin ? 'HR Admin' : 'Employee')}
                </div>
              </div>
            </div>
            <span
              className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                isAdmin
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20'
              }`}
            >
              {user?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-500/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all group shadow-sm"
          >
            <LogOut className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
