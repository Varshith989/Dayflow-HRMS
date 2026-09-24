import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserCircle,
  Sun,
  Moon,
  LogOut,
  ArrowRight,
  Eye,
  Command,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useEmployeeInspection } from '../../context/EmployeeInspectionContext';
import api from '../../api/client';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { selectEmployee } = useEmployeeInspection();
  const toast = useToast();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Fetch employees list for admins
  useEffect(() => {
    if (isOpen && isAdmin && employees.length === 0) {
      const load = async () => {
        try {
          setLoadingEmployees(true);
          const res = await api.get('/users');
          if (res.data.success) {
            setEmployees(res.data.employees || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingEmployees(false);
        }
      };
      load();
    }
  }, [isOpen, isAdmin, employees.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navItems = isAdmin
    ? [
        { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard, category: 'Navigation' },
        { label: 'Employee Directory', path: '/admin/employees', icon: Users, category: 'Navigation' },
        { label: 'All Attendance', path: '/admin/attendance', icon: Clock, category: 'Navigation' },
        { label: 'Time Off Approvals', path: '/admin/leaves', icon: CalendarDays, category: 'Navigation' },
        { label: 'Payroll Management', path: '/admin/payroll', icon: DollarSign, category: 'Navigation' },
        { label: 'Admin Profile', path: '/admin/profile', icon: UserCircle, category: 'Navigation' },
      ]
    : [
        { label: 'Employee Dashboard', path: '/employee', icon: LayoutDashboard, category: 'Navigation' },
        { label: 'My Attendance Logs', path: '/employee/attendance', icon: Clock, category: 'Navigation' },
        { label: 'My Time Off Requests', path: '/employee/leaves', icon: CalendarDays, category: 'Navigation' },
        { label: 'My Salary & Payslips', path: '/employee/salary', icon: DollarSign, category: 'Navigation' },
        { label: 'My Profile & Settings', path: '/employee/profile', icon: UserCircle, category: 'Navigation' },
      ];

  const quickActions = [
    {
      label: `Switch to ${isDark ? 'Light' : 'Dark'} Theme`,
      action: () => {
        toggleTheme();
        onClose();
      },
      icon: isDark ? Sun : Moon,
      category: 'Preferences',
    },
    {
      label: 'Sign Out of Dayflow',
      action: async () => {
        onClose();
        await logout();
        toast.info('Signed out successfully');
        navigate('/login');
      },
      icon: LogOut,
      category: 'Preferences',
    },
  ];

  // Filter items
  const q = query.trim().toLowerCase();

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(q)
  );

  const filteredActions = quickActions.filter((action) =>
    action.label.toLowerCase().includes(q)
  );

  const filteredEmployees = isAdmin
    ? employees.filter((emp) =>
        emp.name?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.department?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q)
      ).slice(0, 6)
    : [];

  const allItems = [
    ...filteredNav.map((item) => ({ ...item, type: 'nav' })),
    ...filteredActions.map((action) => ({ ...action, type: 'action' })),
    ...filteredEmployees.map((emp) => ({
      label: `${emp.name} (${emp.employeeId})`,
      sublabel: `${emp.designation} • ${emp.department}`,
      icon: Users,
      category: 'Employees',
      type: 'employee',
      employee: emp,
    })),
  ];

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = allItems[selectedIndex];
      if (!selected) return;

      if (selected.type === 'nav') {
        navigate(selected.path);
        onClose();
      } else if (selected.type === 'action') {
        selected.action();
      } else if (selected.type === 'employee') {
        selectEmployee(selected.employee, 'dashboard');
        navigate('/admin/employee-view');
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
      />

      {/* Palette Container */}
      <div
        onKeyDown={handleKeyDown}
        className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 text-xs">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              No matching commands or employees found.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={`${item.category}-${item.label}-${idx}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    if (item.type === 'nav') {
                      navigate(item.path);
                      onClose();
                    } else if (item.type === 'action') {
                      item.action();
                    } else if (item.type === 'employee') {
                      selectEmployee(item.employee, 'dashboard');
                      navigate('/admin/employee-view');
                      onClose();
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1 rounded-md ${
                      isSelected
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <div className="truncate">
                      <div className="font-medium truncate">{item.label}</div>
                      {item.sublabel && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 uppercase tracking-wider shrink-0 ml-2">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to navigate</span>
            <span><kbd className="font-mono">↵</kbd> to select</span>
          </div>
          <span>Dayflow Command Center</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
