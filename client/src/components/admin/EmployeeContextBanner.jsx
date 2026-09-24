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
} from 'lucide-react';
import { useEmployeeInspection } from '../../context/EmployeeInspectionContext';
import { useAuth } from '../../context/AuthContext';
import demoAvatars from '../../utils/avatars';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const EmployeeContextBanner = ({ onTabChange }) => {
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
    <div className="sticky top-12 z-20 bg-slate-900 text-white border-b border-slate-800 shadow-dropdown px-4 sm:px-6 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        {/* Employee Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={inspectedEmployee.avatar || demoAvatars.generic(inspectedEmployee.name)}
              alt={inspectedEmployee.name}
              className="w-7 h-7 rounded-md object-cover border border-slate-700"
            />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-400 ring-2 ring-slate-900" />
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Badge variant="warning" dot size="xs">
              360° Inspection
            </Badge>
            <span className="font-mono text-xs font-semibold text-slate-300">
              {inspectedEmployee.employeeId}
            </span>
            <span className="text-xs font-bold text-white truncate">
              {inspectedEmployee.name}
            </span>
            <span className="text-xs text-slate-400 truncate">
              • {inspectedEmployee.designation || 'Staff'} ({inspectedEmployee.department || 'General'})
            </span>
          </div>
        </div>

        {/* Tab Shortcuts & Exit */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTabClick(t.id)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-subtle'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={clearInspectedEmployee}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Inspection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeContextBanner;
