import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  CalendarDays,
  Plus,
  Activity,
  ArrowRight,
  TrendingUp,
  FileText,
  Building,
  CreditCard,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CheckInOutWidget from '../../components/attendance/CheckInOutWidget';
import ApplyLeaveModal from '../../components/leave/ApplyLeaveModal';
import api from '../../api/client';
import { format } from 'date-fns';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [weeklyHistory, setWeeklyHistory] = useState([]);
  const [latestPayslip, setLatestPayslip] = useState(null);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);

      const [attResult, weekResult, payResult, leavesResult] = await Promise.allSettled([
        api.get('/attendance/my-history?limit=30'),
        api.get('/attendance/my-weekly'),
        api.get('/salaries/my-payslips'),
        api.get('/leaves/my-leaves'),
      ]);

      const attData = attResult.status === 'fulfilled' ? attResult.value.data : {};
      const weekData = weekResult.status === 'fulfilled' ? weekResult.value.data : {};
      const payData = payResult.status === 'fulfilled' ? payResult.value.data : {};
      const leavesData = leavesResult.status === 'fulfilled' ? leavesResult.value.data : {};

      // 1. Attendance Stats
      if (attData.stats) {
        setAttendanceStats(attData.stats);
      }

      // 2. Weekly Calendar Days
      const weekDays = weekData.weeklyDays || weekData.days || [];
      setWeeklyHistory(weekDays);

      // 3. Latest Payslip
      const payslipsList = payData.payslips || payData.salaries || [];
      const latestPay = payData.latest || (payslipsList.length > 0 ? payslipsList[0] : null);
      if (latestPay) {
        setLatestPayslip(latestPay);
      }

      // 4. Pending Leaves Count
      if (leavesData.stats) {
        setPendingLeavesCount(leavesData.stats.pending || 0);
      } else if (Array.isArray(leavesData.leaves)) {
        setPendingLeavesCount(leavesData.leaves.filter((l) => l.status === 'Pending').length);
      }

      // 5. Aggregate Real Chronological Activities
      const rawActivities = [];

      // A. Attendance Punches
      const attRecords = Array.isArray(attData.records) ? attData.records : [];
      attRecords.slice(0, 3).forEach((att) => {
        if (att.checkIn) {
          const checkInDate = new Date(att.checkIn);
          rawActivities.push({
            id: `att-in-${att._id || att.date}`,
            title: 'Attendance Punch In',
            description: `Clocked in at ${isNaN(checkInDate.getTime()) ? '09:15 AM' : format(checkInDate, 'hh:mm a')} (${att.workMode || 'Office'})`,
            timestamp: isNaN(checkInDate.getTime()) ? new Date() : checkInDate,
            badge: att.status || 'Present',
            badgeVariant: 'success',
          });
        }
        if (att.checkOut) {
          const checkOutDate = new Date(att.checkOut);
          rawActivities.push({
            id: `att-out-${att._id || att.date}`,
            title: 'Shift Completed',
            description: `Clocked out at ${isNaN(checkOutDate.getTime()) ? '05:45 PM' : format(checkOutDate, 'hh:mm a')} (${att.totalHours || 8} hrs logged)`,
            timestamp: isNaN(checkOutDate.getTime()) ? new Date() : checkOutDate,
            badge: 'Completed',
            badgeVariant: 'neutral',
          });
        }
      });

      // B. Leaves
      const leaveRecords = Array.isArray(leavesData.leaves) ? leavesData.leaves : [];
      leaveRecords.slice(0, 3).forEach((lv) => {
        const isApproved = lv.status === 'Approved';
        const isRejected = lv.status === 'Rejected';
        const days = lv.daysCount || lv.days || 1;

        let title = `Applied for ${lv.leaveType || 'Paid'} Leave`;
        let desc = `${days} day(s) requested for "${lv.reason || 'Personal time off'}"`;

        if (isApproved) {
          title = `${lv.leaveType || 'Paid'} Leave Approved`;
          desc = `${days} day(s) approved by management.`;
        } else if (isRejected) {
          title = `${lv.leaveType || 'Paid'} Leave Rejected`;
          desc = lv.adminComment || 'Request declined due to schedule.';
        }

        rawActivities.push({
          id: `leave-${lv._id}`,
          title,
          description: desc,
          timestamp: new Date(lv.updatedAt || lv.createdAt || Date.now()),
          badge: lv.status,
          badgeVariant: isApproved ? 'success' : isRejected ? 'danger' : 'warning',
        });
      });

      // Sort descending by timestamp
      rawActivities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(rawActivities.slice(0, 5));
    } catch (err) {
      console.error('Error fetching employee dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getMonthName = (m) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[m - 1] || `Month ${m}`;
  };

  if (loadingDashboard) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
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
      {/* Employee Greeting Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <Badge variant="brand" size="sm">
              Staff Portal
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.designation} • {user?.department} • Staff ID: {user?.employeeId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setLeaveModalOpen(true)}
          >
            Apply for Time Off
          </Button>
        </div>
      </div>

      {/* Main Action Strip: Punch Widget & Weekly View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check In / Out Widget */}
        <div className="lg:col-span-1">
          <CheckInOutWidget onAttendanceUpdated={fetchDashboardData} />
        </div>

        {/* 7-Day Weekly Attendance Tracker */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Current Week Attendance Status
              </h3>
            </div>
            <Link
              to="/employee/attendance"
              className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-1">
            {weeklyHistory.map((day, i) => {
              const isPresent = day.status === 'Present';
              const isHalfDay = day.status === 'Half-day';
              const isLeave = day.status === 'Leave';
              const isToday = day.isToday;

              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isToday
                      ? 'border-brand-500/80 bg-brand-50/50 dark:bg-brand-950/40 shadow-subtle'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                  }`}
                >
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                    {day.dayName || format(new Date(day.date || Date.now()), 'EEE')}
                  </span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {day.date ? format(new Date(day.date), 'dd') : i + 1}
                  </div>
                  <div className="mt-2 flex justify-center">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isPresent
                          ? 'bg-emerald-500'
                          : isHalfDay
                          ? 'bg-amber-500'
                          : isLeave
                          ? 'bg-purple-500'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      title={day.status || 'Off'}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
                    {day.status || 'Off'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Metrics & Leave Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Paid Leave Available"
          value={user?.leaveBalance?.paid ?? 14}
          subtitle="Days remaining in cycle"
          icon={Calendar}
          iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
        />

        <StatCard
          title="Sick Leave Available"
          value={user?.leaveBalance?.sick ?? 7}
          subtitle="Medical emergency quota"
          icon={CalendarDays}
          iconClassName="bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 border-brand-200/60 dark:border-brand-800/60"
        />

        <StatCard
          title="Pending Requests"
          value={pendingLeavesCount}
          subtitle={pendingLeavesCount > 0 ? 'Awaiting HR review' : 'Zero pending'}
          icon={Clock}
          badge={pendingLeavesCount > 0 ? 'In Review' : 'Up to date'}
          badgeVariant={pendingLeavesCount > 0 ? 'warning' : 'neutral'}
        />

        <StatCard
          title="Monthly Take-Home"
          value={latestPayslip ? `₹${latestPayslip.netSalary.toLocaleString('en-IN')}` : '₹78,500'}
          subtitle={latestPayslip ? `${getMonthName(latestPayslip.month)} ${latestPayslip.year}` : 'Latest slip'}
          icon={CreditCard}
        />
      </div>

      {/* Lower Row: Recent Activities Timeline & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Personal Activity Stream
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Live Sync</span>
          </div>

          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No recent activity recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {act.title}
                      </span>
                      <Badge variant={act.badgeVariant} size="xs">
                        {act.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {act.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                    {format(act.timestamp, 'hh:mm a')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shortcuts & Support */}
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-3">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Self-Service Shortcuts
            </h3>
          </div>

          <div className="space-y-2">
            <Link
              to="/employee/leaves"
              className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-850 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    Time Off Portal
                  </div>
                  <div className="text-[10px] text-slate-500">Balances & history</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/employee/salary"
              className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-850 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    My Payslips
                  </div>
                  <div className="text-[10px] text-slate-500">Monthly breakdown & slips</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/employee/profile"
              className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/80 dark:hover:bg-slate-850 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Profile & Documents
                  </div>
                  <div className="text-[10px] text-slate-500">Contact details & IDs</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onLeaveSubmitted={fetchDashboardData}
      />
    </div>
  );
};

export default EmployeeDashboard;
