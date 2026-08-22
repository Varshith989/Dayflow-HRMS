import React from 'react';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  DollarSign,
  FileText,
  X,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { useEmployeeInspection } from '../../context/EmployeeInspectionContext';
import { useAuth } from '../../context/AuthContext';
import demoAvatars from '../../utils/avatars';

const EmployeeContextBanner = ({ onTabChange }) => {
  const { inspectedEmployee, clearInspectedEmployee, activeTab, setActiveTab } = useEmployeeInspection();
  const { isAdmin } = useAuth();

  if (!isAdmin || !inspectedEmployee) return null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leaves', icon: CalendarDays },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  return (
    <div className="sticky top-16 z-20 bg-gradient-to-r from-brand-900/95 via-indigo-900/95 to-slate-900/95 text-white border-b border-brand-500/30 shadow-lg backdrop-blur-md transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Employee Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={inspectedEmployee.avatar || demoAvatars.generic(inspectedEmployee.name)}
              alt={inspectedEmployee.name}
              className="w-10 h-10 rounded-xl object-cover border-2 border-brand-400/80 shadow-sm"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wider flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Admin View • Employee Context
              </span>
              <span className="text-[11px] font-mono text-brand-200 bg-brand-950/60 px-1.5 py-0.5 rounded border border-brand-800">
                {inspectedEmployee.employeeId}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-200 truncate">
              <span className="font-bold text-white text-sm">{inspectedEmployee.name}</span>
              <span className="text-brand-300">•</span>
              <span className="text-brand-200 truncate">
                {inspectedEmployee.designation || 'Staff'} ({inspectedEmployee.department || 'General'})
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Quick Navigation Tabs & Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTabClick(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm ring-1 ring-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={clearInspectedEmployee}
            title="Return to regular Admin Dashboard"
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 hover:text-white shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Employee View</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeContextBanner;
