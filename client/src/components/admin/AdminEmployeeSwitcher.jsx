import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  X,
  Eye,
  Check,
} from 'lucide-react';
import api from '../../api/client';
import demoAvatars from '../../utils/avatars';
import { useNavigate } from 'react-router-dom';
import { useEmployeeInspection } from '../../context/EmployeeInspectionContext';
import { Badge } from '../ui/Badge';

export const AdminEmployeeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const {
    inspectedEmployee,
    selectEmployee,
    clearInspectedEmployee,
  } = useEmployeeInspection();

  const navigate = useNavigate();

  // Close on outside click
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

  // Fetch employees
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
      emp.department?.toLowerCase().includes(q)
    );
  });

  const handleSelectEmployee = (emp) => {
    selectEmployee(emp, 'dashboard');
    setIsOpen(false);
    navigate('/admin/employee-view');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          inspectedEmployee
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-800 dark:text-amber-300'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
        }`}
      >
        <Eye className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">
          {inspectedEmployee ? `Inspecting: ${inspectedEmployee.name.split(' ')[0]}` : '360° Inspection'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-dropdown p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Inspect Personnel
            </span>
            {inspectedEmployee && (
              <button
                onClick={() => {
                  clearInspectedEmployee();
                  setIsOpen(false);
                }}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline font-medium"
              >
                Clear View
              </button>
            )}
          </div>

          <div className="p-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-2.5 my-auto" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff by name or ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-0.5 p-1 text-xs">
            {loading ? (
              <div className="p-4 text-center text-slate-400">Loading directory...</div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No staff found.</div>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelected = inspectedEmployee?._id === emp._id;
                return (
                  <div
                    key={emp._id}
                    onClick={() => handleSelectEmployee(emp)}
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={emp.avatar || demoAvatars.generic(emp.name)}
                        alt={emp.name}
                        className="w-7 h-7 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-semibold truncate">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {emp.employeeId} • {emp.department}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeSwitcher;
