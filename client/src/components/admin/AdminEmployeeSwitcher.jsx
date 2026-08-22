import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  X,
  Calendar,
  DollarSign,
  HeartHandshake,
  FileText,
  ExternalLink,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/client';
import demoAvatars from '../../utils/avatars';
import { useNavigate } from 'react-router-dom';

const AdminEmployeeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q)
    );
  });

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setShowDrawer(true);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Switcher trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-xs font-bold transition-all shadow-sm"
      >
        <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
        <span className="hidden md:inline">
          {selectedEmployee ? `Viewing: ${selectedEmployee.name.split(' ')[0]}` : 'Switch Employee'}
        </span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                Admin Employee Switcher
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {employees.length} Staff
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-3 my-auto" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID or department..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Employee List */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {loading ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading directory...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No employees match search.</div>
              ) : (
                filteredEmployees.map((emp) => (
                  <button
                    key={emp._id}
                    type="button"
                    onClick={() => handleSelectEmployee(emp)}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={emp.avatar || demoAvatars.generic(emp.name?.slice(0, 2))}
                        alt={emp.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-300">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {emp.designation} • {emp.department}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                      {emp.employeeId}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Selected Employee Context Modal / Quick Inspect */}
      {showDrawer && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmployee.avatar || demoAvatars.generic(selectedEmployee.name?.slice(0, 2))}
                  alt={selectedEmployee.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-brand-500/50 shadow-glow"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedEmployee.name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300">
                      {selectedEmployee.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedEmployee.designation} • {selectedEmployee.department}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block uppercase font-semibold text-[10px]">
                  Employee ID
                </span>
                <span className="text-slate-900 dark:text-white font-mono font-bold mt-0.5 block">
                  {selectedEmployee.employeeId}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block uppercase font-semibold text-[10px]">
                  Work Email
                </span>
                <span className="text-slate-900 dark:text-white font-medium truncate mt-0.5 block">
                  {selectedEmployee.email}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block uppercase font-semibold text-[10px]">
                  Leave Balance
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">
                  {selectedEmployee.leaveBalance?.paid || 0} Paid • {selectedEmployee.leaveBalance?.sick || 0} Sick
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block uppercase font-semibold text-[10px]">
                  Status
                </span>
                <span className="text-slate-900 dark:text-white font-bold mt-0.5 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {selectedEmployee.status}
                </span>
              </div>
            </div>

            {/* Quick module action navigation buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Direct Module Jump (Admin Context)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDrawer(false);
                    navigate('/admin/attendance');
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  Attendance
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDrawer(false);
                    navigate('/admin/leaves');
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
                  Leave Requests
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDrawer(false);
                    navigate('/admin/payroll');
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                  Salary Payslip
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Close Context
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeSwitcher;
