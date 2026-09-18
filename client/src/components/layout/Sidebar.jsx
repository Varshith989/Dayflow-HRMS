import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Building2,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DayflowLogo, DayflowIcon } from '../common/DayflowLogo';

export const Sidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out of Dayflow');
    navigate('/login');
  };

  const adminNavSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'Workforce',
      items: [
        { label: 'Employees', path: '/admin/employees', icon: Users },
      ],
    },
    {
      title: 'Time & Leaves',
      items: [
        { label: 'Attendance', path: '/admin/attendance', icon: Clock },
        { label: 'Time Off Approvals', path: '/admin/leaves', icon: CalendarDays },
      ],
    },
    {
      title: 'Finance',
      items: [
        { label: 'Payroll', path: '/admin/payroll', icon: DollarSign },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'My Profile', path: '/admin/profile', icon: UserCircle },
      ],
    },
  ];

  const employeeNavSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/employee', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'Time & Schedule',
      items: [
        { label: 'My Attendance', path: '/employee/attendance', icon: Clock },
        { label: 'Time Off Requests', path: '/employee/leaves', icon: CalendarDays },
      ],
    },
    {
      title: 'Compensation',
      items: [
        { label: 'My Payslips', path: '/employee/salary', icon: DollarSign },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'My Profile', path: '/employee/profile', icon: UserCircle },
      ],
    },
  ];

  const navSections = isAdmin ? adminNavSections : employeeNavSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/50 dark:bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800/90 flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isCollapsed ? 'w-18' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Brand & Workspace Header */}
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <DayflowLogo iconSize={26} showTagline={false} />
                <div className="flex items-center gap-1">
                  {onToggleCollapse && (
                    <button
                      type="button"
                      onClick={onToggleCollapse}
                      title="Collapse sidebar"
                      className="hidden lg:flex p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-3">
                <DayflowIcon size={26} />
                {onToggleCollapse && (
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    title="Expand sidebar"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Organization Pill / Workspace Selector */}
          {!isCollapsed && (
            <div className="px-3 pt-3 pb-1">
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded bg-brand-600/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-3 h-3" />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                      Acme Corp
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      Enterprise Plan
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  HQ
                </span>
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <nav className="p-3 space-y-4 flex-1">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => onClose?.()}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center ${
                          isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-2.5 py-1.5'
                        } rounded-lg text-xs font-medium transition-all duration-150 group select-none ${
                          isActive
                            ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200/60 dark:border-brand-800/60 shadow-subtle'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive
                                  ? 'text-brand-600 dark:text-brand-400'
                                  : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                              }`}
                            />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </div>
                          {!isCollapsed && isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 shrink-0" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Card & Actions */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shadow-subtle">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.designation || (isAdmin ? 'Admin' : 'Staff')}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                  {user?.role}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-1.5 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <img
                src={user?.avatar}
                alt={user?.name}
                title={user?.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer"
              />
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
