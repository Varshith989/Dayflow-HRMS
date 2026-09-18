import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  Building,
  ArrowRight,
  TrendingUp,
  Check,
  X,
  Sparkles,
  Activity,
  RotateCw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ totalPresent: 0, totalHalfDay: 0, totalLeave: 0 });
  const [todayRecords, setTodayRecords] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [leaveStats, setLeaveStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [payrollStats, setPayrollStats] = useState({ totalDisbursed: 0, totalGross: 0, paidCount: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);

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

      if (isManualRefresh) {
        toast.success('Command center metrics refreshed');
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickDecision = async (leaveId, status) => {
    try {
      const res = await api.put(`/leaves/${leaveId}/status`, {
        status,
        adminComment: status === 'Approved' ? 'Approved via Quick Action Queue' : 'Rejected via Quick Action Queue',
      });
      if (res.data.success) {
        toast.success(`Leave request ${status.toLowerCase()} successfully`);
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
    Engineering: 'bg-indigo-500',
    'Product Design': 'bg-purple-500',
    'Sales & Marketing': 'bg-amber-500',
    'Human Resources': 'bg-emerald-500',
    Finance: 'bg-sky-500',
  };

  if (loading && !isRefreshing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={4} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Operations Command Center
            </h1>
            <Badge variant="success" dot size="sm">
              Live Systems
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time workforce attendance, action approval queues, and departmental metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden md:block">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </span>
            <div className="text-[11px] text-slate-400">Organization: Acme Corp</div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            loading={isRefreshing}
            icon={RotateCw}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Workforce Size"
          value={employees.length}
          subtitle={`${activeEmployees} active personnel`}
          icon={Users}
          badge={`${Object.keys(deptCounts).length} Depts`}
        />

        <StatCard
          title="Present Today"
          value={`${attendanceStats.totalPresent} / ${totalEmployees}`}
          subtitle={`${presentRate}% attendance`}
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
          trend="up"
          trendValue={`${presentRate}%`}
        />

        <StatCard
          title="Pending Approvals"
          value={pendingLeaves.length}
          subtitle={pendingLeaves.length > 0 ? 'Requires admin action' : 'All caught up'}
          icon={Clock}
          iconClassName={
            pendingLeaves.length > 0
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }
          badge={pendingLeaves.length > 0 ? 'Action Needed' : 'Zero Pending'}
          badgeVariant={pendingLeaves.length > 0 ? 'warning' : 'neutral'}
        />

        <StatCard
          title="Monthly Payroll (Aug)"
          value={`₹${(payrollStats.totalDisbursed || 568700).toLocaleString('en-IN')}`}
          subtitle="Net disbursed salary"
          icon={DollarSign}
          iconClassName="bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 border-brand-200/60 dark:border-brand-800/60"
          badge="Processed"
        />
      </div>

      {/* Action Center: Needs Attention & Approvals Queue */}
      <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle dark:shadow-card overflow-hidden">
        <div className="p-4 sm:px-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Needs Your Attention — Pending Leave Requests
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1-click review and decision directly from command queue
              </p>
            </div>
          </div>

          <Link
            to="/admin/leaves"
            className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-1 group"
          >
            <span>Full Leave Portal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              All Leave Requests Processed
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              There are no pending employee time off requests requiring attention.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {pendingLeaves.slice(0, 4).map((leave) => (
              <div
                key={leave._id}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={leave.userId?.avatar}
                    alt={leave.userId?.name}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {leave.userId?.name}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        ({leave.userId?.department || 'Staff'})
                      </span>
                      <Badge variant="brand" size="xs">
                        {leave.leaveType}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {leave.startDate} to {leave.endDate}
                      </span>{' '}
                      • {leave.daysCount} day{leave.daysCount > 1 ? 's' : ''}
                    </div>
                    {leave.reason && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-lg mt-0.5">
                        "{leave.reason}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    variant="success"
                    size="xs"
                    icon={Check}
                    onClick={() => handleQuickDecision(leave._id, 'Approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="dangerOutline"
                    size="xs"
                    icon={X}
                    onClick={() => handleQuickDecision(leave._id, 'Rejected')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Grid: Department Distribution & Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Workforce by Department
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {totalEmployees} Staff Total
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = Math.round((count / totalEmployees) * 100);
              const colorClass = departmentColors[dept] || 'bg-brand-500';
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{dept}</span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorClass} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roll Call Status Breakdown */}
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Today's Roll Call Status
              </h3>
            </div>
            <Badge variant="success" size="xs">
              {presentRate}% Present
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                  Present
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {attendanceStats.totalPresent}
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase">
                  Half-Day
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {attendanceStats.totalHalfDay}
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase">
                  On Leave
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {attendanceStats.totalLeave}
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            </div>

            <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase">
                  Absent / Off
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {Math.max(
                    0,
                    totalEmployees -
                      (attendanceStats.totalPresent +
                        attendanceStats.totalHalfDay +
                        attendanceStats.totalLeave)
                  )}
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Punch Feed & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Attendance Roll Call Feed */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Live Attendance Roll Call Feed
              </h3>
            </div>
            <Link
              to="/admin/attendance"
              className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>View All Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No punch events recorded yet today.
            </div>
          ) : (
            <div className="space-y-2">
              {todayRecords.slice(0, 5).map((r) => (
                <div
                  key={r._id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={r.userId?.avatar}
                      alt={r.userId?.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {r.userId?.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {r.userId?.department} • <span className="font-medium text-slate-700 dark:text-slate-300">{r.workMode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '—'}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {r.totalHours ? `${r.totalHours} hrs` : 'Active Shift'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Shortcuts */}
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-3">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Enterprise Shortcuts
            </h3>
          </div>

          <div className="space-y-2">
            <Link
              to="/admin/employees"
              className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-850 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    Staff Directory
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Manage 360 employee records</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/attendance"
              className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-850 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Attendance Roll Call
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Daily verification & logs</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/leaves"
              className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-850 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Time Off Approvals
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Review employee leaves</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/payroll"
              className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-850 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    Payroll & Payslips
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Monthly salary management</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
