import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  Building,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  Sparkles,
  PieChart,
  Activity,
  ArrowUpRight,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ totalPresent: 0, totalHalfDay: 0, totalLeave: 0 });
  const [todayRecords, setTodayRecords] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leaveStats, setLeaveStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [payrollStats, setPayrollStats] = useState({ totalDisbursed: 0, totalGross: 0, paidCount: 0 });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [attRes, usersRes, leavesRes, payRes] = await Promise.all([
        api.get('/attendance/all'),
        api.get('/users'),
        api.get('/leaves/all?status=Pending'),
        api.get('/salaries/all?month=8&year=2026'),
      ]);

      if (attRes.data.success) {
        setAttendanceStats(attRes.data.stats || { totalPresent: 0, totalHalfDay: 0, totalLeave: 0 });
        setTodayRecords(attRes.data.records || []);
      }

      if (usersRes.data.success) {
        setEmployees(usersRes.data.employees || []);
      }

      if (leavesRes.data.success) {
        setPendingLeaves(leavesRes.data.leaves || []);
        if (leavesRes.data.stats) setLeaveStats(leavesRes.data.stats);
      }

      if (payRes.data.success && payRes.data.stats) {
        setPayrollStats(payRes.data.stats);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick 1-click approve/reject from dashboard
  const handleQuickDecision = async (leaveId, status) => {
    try {
      const res = await api.put(`/leaves/${leaveId}/status`, {
        status,
        adminComment: status === 'Approved' ? 'Quick approved via Admin Dashboard' : 'Rejected via Admin Dashboard',
      });
      if (res.data.success) {
        toast.success(`Leave request ${status.toLowerCase()}!`);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error('Failed to process leave decision');
    }
  };

  const totalEmployees = employees.length || 1;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const presentRate = Math.min(100, Math.round((attendanceStats.totalPresent / totalEmployees) * 100));

  // Department distribution calculation
  const deptCounts = employees.reduce((acc, emp) => {
    const dept = emp.department || 'General';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentColors = {
    Engineering: 'from-blue-500 to-indigo-600',
    'Product Design': 'from-purple-500 to-pink-500',
    'Sales & Marketing': 'from-amber-500 to-orange-600',
    'Human Resources': 'from-emerald-500 to-teal-600',
    Finance: 'from-cyan-500 to-blue-600',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-950/80 via-slate-900 to-indigo-950/60 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> HR Operations Center • Live Status
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Real-time workforce intelligence, employee attendance roll call, and pending approvals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <span className="text-2xl font-black text-white">{totalEmployees}</span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                Total Staff
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <span className="text-2xl font-black text-emerald-400">
                {attendanceStats.totalPresent}
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                Present Today
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <span className="text-2xl font-black text-amber-400">
                {pendingLeaves.length}
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                Pending Leaves
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Today's Roll Call
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {attendanceStats.totalPresent} / {totalEmployees}
            </div>
            <span className="text-[11px] text-emerald-300/80 mt-0.5 block flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {presentRate}% attendance rate
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {pendingLeaves.length}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {pendingLeaves.length > 0 ? 'Requires HR action' : 'All caught up!'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Workforce */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Active Workforce
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {activeEmployees} <span className="text-xs font-normal text-slate-400">active</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Across {Object.keys(deptCounts).length} departments
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Payroll Disbursed */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Payroll Volume (Aug)
            </span>
            <div className="text-2xl font-black text-indigo-300 mt-1">
              ₹{(payrollStats.totalDisbursed || 568700).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Monthly net disbursement
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Department Distribution & Attendance Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Workforce Distribution */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-400" />
              Workforce Distribution by Department
            </h3>
            <span className="text-xs text-slate-400 font-mono">{totalEmployees} Total</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / totalEmployees) * 100);
              const gradient = departmentColors[dept] || 'from-indigo-500 to-brand-500';
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{dept}</span>
                    <span className="text-slate-400">
                      {count} {count === 1 ? 'member' : 'members'} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Attendance Breakdown */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Today's Attendance Status Breakdown
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">{presentRate}% Present</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase">Present</span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {attendanceStats.totalPresent}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-glow" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 uppercase">Half-Day</span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {attendanceStats.totalHalfDay}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-amber-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-violet-400 uppercase">On Leave</span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {attendanceStats.totalLeave}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-violet-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-rose-400 uppercase">Absent / Off</span>
                <div className="text-xl font-bold text-white mt-0.5">
                  {Math.max(
                    0,
                    totalEmployees -
                      (attendanceStats.totalPresent +
                        attendanceStats.totalHalfDay +
                        attendanceStats.totalLeave)
                  )}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-rose-400" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
            <span>Attendance records are synced in real-time upon employee punch in/out.</span>
          </div>
        </div>
      </div>

      {/* Pending Leave Approvals Action Queue */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-card">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pending Leave Approvals Queue
              </h3>
              <p className="text-xs text-slate-400">Fast 1-click review directly from dashboard</p>
            </div>
          </div>

          <Link
            to="/admin/leaves"
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            <span>View Full Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-950/50 border border-slate-800/60">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-white">All Leave Requests Processed</p>
            <p className="text-slate-500 mt-0.5">No pending employee leave requests requiring review.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingLeaves.slice(0, 3).map((l) => (
              <div
                key={l._id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      l.userId?.avatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
                    }
                    alt={l.userId?.name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {l.userId?.name}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({l.userId?.department})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      <span className="font-semibold text-brand-300">{l.leaveType} Leave</span>: {l.startDate} to {l.endDate} ({l.daysCount} days)
                    </div>
                    <div className="text-[10px] text-slate-500 italic mt-0.5">
                      "{l.reason}"
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleQuickDecision(l._id, 'Approved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleQuickDecision(l._id, 'Rejected')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Punch Feed & Quick Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Punch Feed */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              Today's Live Attendance Feed
            </h3>
            <Link
              to="/admin/attendance"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No punch events recorded yet today.
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayRecords.slice(0, 4).map((r) => (
                <div
                  key={r._id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        r.userId?.avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
                      }
                      alt={r.userId?.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{r.userId?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.userId?.department} • <span className="font-semibold text-slate-300">{r.workMode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '—'}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {r.totalHours ? `${r.totalHours} hrs` : 'Working...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HR Operations Shortcuts */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-card">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            HR Module Shortcuts
          </h3>

          <div className="space-y-2.5">
            <Link
              to="/admin/employees"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-brand-300">
                    Employee Directory
                  </div>
                  <div className="text-[10px] text-slate-400">Staff management & profiles</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/attendance"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                    Attendance Roll Call
                  </div>
                  <div className="text-[10px] text-slate-400">Daily verification & logs</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/leaves"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-violet-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-violet-300">
                    Leave Approvals
                  </div>
                  <div className="text-[10px] text-slate-400">Manage time off requests</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/payroll"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                    Company Payroll
                  </div>
                  <div className="text-[10px] text-slate-400">Monthly payslips & taxes</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
