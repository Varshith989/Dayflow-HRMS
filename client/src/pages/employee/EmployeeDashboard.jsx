import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CheckInOutWidget from '../../components/attendance/CheckInOutWidget';
import api from '../../api/client';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/attendance/my-history?limit=30');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-brand-950/40 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Logged in as Employee ({user?.employeeId})
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              {user?.designation} • <span className="text-brand-400">{user?.department}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
              <span className="text-2xl font-black text-brand-400">
                {(user?.leaveBalance?.paid || 0) + (user?.leaveBalance?.sick || 0)}
              </span>
              <p className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">
                Leaves Available
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
              <span className="text-2xl font-black text-emerald-400">
                {stats?.presentCount || 0}
              </span>
              <p className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">
                Days Present
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Interactive Check In/Out Widget */}
      <CheckInOutWidget onAttendanceChange={fetchStats} />

      {/* Quick Access Modules */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" /> Employee Self-Service Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/employee/profile"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-850 transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-3">
                <User className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                My Profile
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Personal info & emergency contacts
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-brand-400 mt-3">
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/employee/attendance"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                Attendance Log
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Weekly calendar & working hours
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 mt-3">
              <span>View Attendance</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/employee/leaves"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-850 transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                Time Off & Leaves
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Apply leave & check approvals
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-violet-400 mt-3">
              <span>Apply Leave</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/employee/salary"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all group flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                My Payslips
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Salary breakdown & deductions
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-3">
              <span>View Payslips</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
