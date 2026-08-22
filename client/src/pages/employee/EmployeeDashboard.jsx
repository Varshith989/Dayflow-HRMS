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
  HeartHandshake,
  CalendarDays,
  Plus,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CheckInOutWidget from '../../components/attendance/CheckInOutWidget';
import ApplyLeaveModal from '../../components/leave/ApplyLeaveModal';
import api from '../../api/client';
import { format } from 'date-fns';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [latestPayslip, setLatestPayslip] = useState(null);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [attRes, weekRes, payRes, leavesRes] = await Promise.all([
        api.get('/attendance/my-history?limit=30'),
        api.get('/attendance/weekly-view'),
        api.get('/salaries/my-payslips'),
        api.get('/leaves/my-leaves'),
      ]);

      if (attRes.data.success) {
        setAttendanceStats(attRes.data.stats);
      }

      if (weekRes.data.success) {
        setWeeklyHistory(weekRes.data.days || []);
      }

      if (payRes.data.success && payRes.data.latest) {
        setLatestPayslip(payRes.data.latest);
      }

      if (leavesRes.data.success && leavesRes.data.stats) {
        setPendingLeavesCount(leavesRes.data.stats.pending || 0);
      }
    } catch (err) {
      console.error('Failed to fetch employee dashboard data', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalLeaveBalance =
    (user?.leaveBalance?.paid || 0) + (user?.leaveBalance?.sick || 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-brand-900/90 text-white border border-brand-500/20 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Employee Portal • {user?.employeeId}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              {user?.designation} in <span className="text-brand-300 font-semibold">{user?.department}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Time Off</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Leaves */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Available Leaves
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {totalLeaveBalance} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {user?.leaveBalance?.paid || 0} Paid • {user?.leaveBalance?.sick || 0} Sick
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        {/* Days Present */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Days Present (30d)
            </span>
            <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {attendanceStats?.presentCount || 0}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {attendanceStats?.totalHours || 0} total work hours
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Latest Take-Home Pay */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Take-Home Pay (INR)
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ₹{(latestPayslip?.netSalary || 104000).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Disbursed • {latestPayslip?.month ? `Month ${latestPayslip.month}` : 'August'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {pendingLeavesCount}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {pendingLeavesCount > 0 ? 'Under HR review' : 'No active requests'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Primary Interactive Check In/Out Live Punch Widget */}
      <CheckInOutWidget onAttendanceChange={fetchDashboardData} />

      {/* 7-Day Attendance Sparkline & Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 7-Day Weekly Attendance Micro-Grid */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm dark:shadow-card transition-colors">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Past 7 Days Attendance Rhythm
            </h3>
            <Link
              to="/employee/attendance"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {weeklyHistory.length === 0 ? (
              <div className="col-span-7 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Loading weekly attendance stream...
              </div>
            ) : (
              weeklyHistory.map((day, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between text-center min-h-[95px] transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {day.dayName?.slice(0, 3)}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{day.date?.slice(8)}</span>
                  <span
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      day.status === 'Present'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : day.status === 'Half-day'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        : day.status === 'Leave'
                        ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {day.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Self-Service Shortcuts */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm dark:shadow-card transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
            Quick Shortcuts
          </h3>

          <div className="space-y-2.5">
            <Link
              to="/employee/leaves"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300">
                    Time Off Portal
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Apply leave & view history</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/employee/salary"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                    My Salary Payslips
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">View breakdown & taxes</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/employee/profile"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300">
                    Profile & Contacts
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Emergency & personal info</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onSuccess={fetchDashboardData}
        userBalance={user?.leaveBalance || { paid: 14, sick: 7, unpaid: 0 }}
      />
    </div>
  );
};

export default EmployeeDashboard;
