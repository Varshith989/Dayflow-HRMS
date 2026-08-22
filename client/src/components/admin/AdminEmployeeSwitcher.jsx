import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  X,
  Calendar,
  DollarSign,
  HeartHandshake,
  Shield,
  CheckCircle2,
  ArrowRight,
  User,
  Clock,
  FileText,
  LayoutDashboard,
  Eye,
} from 'lucide-react';
import api from '../../api/client';
import demoAvatars from '../../utils/avatars';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEmployeeInspection } from '../../context/EmployeeInspectionContext';

const AdminEmployeeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const {
    inspectedEmployee,
    selectEmployee,
    clearInspectedEmployee,
    setActiveTab,
  } = useEmployeeInspection();

  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch employees when opened
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await api.get('/users');
        if (res.data.success) {
          setEmployees(res.data.employees || []);
        }
      } catch (err) {
        console.error('Failed to load employees for switcher', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && employees.length === 0) {
      fetchEmployees();
    }
  }, [isOpen, employees.length]);

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q)
    );
  });

  const handleSelectEmployee = (emp, tab = 'dashboard') => {
    selectEmployee(emp, tab);
    setIsOpen(false);
    navigate('/admin/employee-view');
  };

  const handleQuickTabJump = (tab) => {
    if (inspectedEmployee) {
      setActiveTab(tab);
      setIsOpen(false);
      navigate('/admin/employee-view');
    }
  };

  const handleExitInspection = () => {
    clearInspectedEmployee();
    setIsOpen(false);
    if (location.pathname === '/admin/employee-view') {
      navigate('/admin');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
          inspectedEmployee
            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 border-brand-400 text-white shadow-glow'
            : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80'
        }`}
      >
        {inspectedEmployee ? (
          <Eye className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        ) : (
          <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
        )}
        <span className="hidden sm:inline">
          {inspectedEmployee
            ? `Viewing: ${inspectedEmployee.name.split(' ')[0]}`
            : 'Switch Employee'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Modern Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span>Admin Employee Switcher</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {employees.length} Staff
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee by name, ID or dept..."
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-2.5 my-auto text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Currently Inspected Employee Quick Jump Card */}
          {inspectedEmployee && (
            <div className="p-3 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/60 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={inspectedEmployee.avatar || demoAvatars.generic(inspectedEmployee.name)}
                    alt={inspectedEmployee.name}
                    className="w-9 h-9 rounded-xl object-cover border border-brand-300 dark:border-brand-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {inspectedEmployee.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {inspectedEmployee.employeeId} • {inspectedEmployee.department}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExitInspection}
                  title="Exit Employee View"
                  className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500 hover:text-white text-[10px] font-bold transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Exit View</span>
                </button>
              </div>

              {/* 6 Quick Action Navigation Buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => handleQuickTabJump('dashboard')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-600 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1 shadow-xs group"
                >
                  <LayoutDashboard className="w-3 h-3 text-brand-500 group-hover:text-white" />
                  <span>Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTabJump('profile')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-600 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1 shadow-xs group"
                >
                  <User className="w-3 h-3 text-brand-500 group-hover:text-white" />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTabJump('attendance')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1 shadow-xs group"
                >
                  <Clock className="w-3 h-3 text-emerald-500 group-hover:text-white" />
                  <span>Attendance</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTabJump('leaves')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1 shadow-xs group"
                >
                  <HeartHandshake className="w-3 h-3 text-amber-500 group-hover:text-white" />
                  <span>Leaves</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTabJump('payroll')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1 shadow-xs group"
                >
                  <DollarSign className="w-3 h-3 text-indigo-500 group-hover:text-white" />
                  <span>Payroll</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTabJump('documents')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1 shadow-xs group"
                >
                  <FileText className="w-3 h-3 text-purple-500 group-hover:text-white" />
                  <span>Documents</span>
                </button>
              </div>
            </div>
          )}

          {/* Scrollable Employee List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {loading ? (
              <div className="p-5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                Loading staff directory...
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-400">No employees match search.</div>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelected = inspectedEmployee?._id === emp._id;
                return (
                  <button
                    key={emp._id}
                    type="button"
                    onClick={() => handleSelectEmployee(emp)}
                    className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2.5 group ${
                      isSelected
                        ? 'bg-brand-500/10 dark:bg-brand-950/60 border border-brand-500/30'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={emp.avatar || demoAvatars.generic(emp.name)}
                        alt={emp.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold truncate transition-colors ${
                            isSelected
                              ? 'text-brand-600 dark:text-brand-300'
                              : 'text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300'
                          }`}
                        >
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {emp.designation} • {emp.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        {emp.employeeId}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      ) : (
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Jump to Directory */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/employees');
              }}
              className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Full Directory</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeSwitcher;
