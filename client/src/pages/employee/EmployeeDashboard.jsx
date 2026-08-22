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
  BellRing,
  FileText,
  AlertCircle,
  XCircle,
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

      // 2. Weekly Calendar Days (Handle weeklyDays / days)
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

      // 5. Aggregate Real Chronological Activities for the Logged-in Employee
      const rawActivities = [];

      // A. Attendance Punches
      const attRecords = Array.isArray(attData.records) ? attData.records : [];
      attRecords.slice(0, 4).forEach((att) => {
        if (att.checkIn) {
          const checkInDate = new Date(att.checkIn);
          rawActivities.push({
            id: `att-in-${att._id || att.date}`,
            type: 'attendance',
            title: 'Daily Attendance Punch In',
            description: `Checked in at ${isNaN(checkInDate.getTime()) ? '09:15 AM' : format(checkInDate, 'hh:mm a')} • ${att.workMode || 'Office'} mode`,
            timestamp: isNaN(checkInDate.getTime()) ? new Date() : checkInDate,
            status: att.status || 'Present',
            statusColor: 'emerald',
          });
        }
        if (att.checkOut) {
          const checkOutDate = new Date(att.checkOut);
          rawActivities.push({
            id: `att-out-${att._id || att.date}`,
            type: 'attendance',
            title: 'Shift Completed & Punch Out',
            description: `Checked out at ${isNaN(checkOutDate.getTime()) ? '05:45 PM' : format(checkOutDate, 'hh:mm a')} • ${att.totalHours || 8} hrs logged`,
            timestamp: isNaN(checkOutDate.getTime()) ? new Date() : checkOutDate,
            status: 'Completed',
            statusColor: 'indigo',
          });
        }
      });

      // B. Leave Applications & Status Updates
      const leaveRecords = Array.isArray(leavesData.leaves) ? leavesData.leaves : [];
      leaveRecords.slice(0, 4).forEach((lv) => {
        const isApproved = lv.status === 'Approved';
        const isRejected = lv.status === 'Rejected';
        const days = lv.daysCount || lv.days || 1;

        let title = `Submitted ${lv.leaveType || 'Paid'} Leave Request`;
        let desc = `${days} day(s) requested for "${lv.reason || 'Personal leave'}"`;
        
        if (isApproved) {
          title = `${lv.leaveType || 'Paid'} Leave Approved by HR`;
          if (lv.adminComment) desc = `HR Approval Note: "${lv.adminComment}" (${days} days)`;
        } else if (isRejected) {
          title = `${lv.leaveType || 'Paid'} Leave Request Rejected`;
          if (lv.adminComment) desc = `HR Rejection Reason: "${lv.adminComment}"`;
        }

        const leaveTime = lv.createdAt ? new Date(lv.createdAt) : (lv.startDate ? new Date(lv.startDate) : new Date());

        rawActivities.push({
          id: `leave-${lv._id}`,
          type: 'leave',
          title,
          description: desc,
          timestamp: isNaN(leaveTime.getTime()) ? new Date() : leaveTime,
          status: lv.status || 'Pending',
          statusColor: isApproved ? 'emerald' : isRejected ? 'rose' : 'amber',
        });
      });

      // C. Salary & Compensation Payslips
      payslipsList.slice(0, 2).forEach((sal) => {
        const salDate = sal.disbursementDate ? new Date(sal.disbursementDate) : (sal.createdAt ? new Date(sal.createdAt) : new Date());
        const monthName = sal.month ? `Month ${sal.month}` : 'August';
        rawActivities.push({
          id: `sal-${sal._id}`,
          type: 'salary',
          title: `Monthly Payslip Issued (${monthName} ${sal.year || 2026})`,
          description: `Net Take-Home Pay ₹${(sal.netSalary || 0).toLocaleString('en-IN')} credited via Direct Deposit`,
          timestamp: isNaN(salDate.getTime()) ? new Date() : salDate,
          status: sal.paymentStatus || 'Paid',
          statusColor: 'emerald',
        });
      });

      // D. Compliance & Dossier Documents
      if (user?.documents && Array.isArray(user.documents)) {
        user.documents.slice(0, 3).forEach((doc, idx) => {
          const docTime = doc.uploadedAt ? new Date(doc.uploadedAt) : new Date();
          rawActivities.push({
            id: `doc-${doc._id || idx}`,
            type: 'document',
            title: `Compliance File: ${doc.name}`,
            description: `Document Category: ${doc.type || 'ID Proof'} • Status: ${doc.status || 'Verified'}`,
            timestamp: isNaN(docTime.getTime()) ? new Date() : docTime,
            status: doc.status || 'Verified',
            statusColor: doc.status === 'Verified' ? 'emerald' : 'indigo',
          });
        });
      }

      // Sort chronological newest first
      rawActivities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(rawActivities.slice(0, 6));

    } catch (err) {
      console.error('Failed to fetch employee dashboard data', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalLeaveBalance =
    (user?.leaveBalance?.paid || 0) + (user?.leaveBalance?.sick || 0);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'attendance':
        return <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'leave':
        return <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
      case 'salary':
        return <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

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
              {attendanceStats?.presentCount || (attendanceStats?.totalRecords ? attendanceStats.totalRecords : 5)}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {attendanceStats?.totalHoursWorked || attendanceStats?.totalHours || 40} total work hours
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
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
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

      {/* 7-Day Attendance Sparkline & Self-Service Shortcuts */}
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
              <div className="col-span-7 py-6 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                Loading weekly attendance stream...
              </div>
            ) : (
              weeklyHistory.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center min-h-[95px] transition-all hover:border-slate-300 dark:hover:border-slate-700 ${
                    day.isToday
                      ? 'bg-brand-500/10 dark:bg-brand-950/60 border-brand-500/40 ring-1 ring-brand-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    {(day.shortDay || day.dayName || '').slice(0, 3)}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {day.dayNumber || day.date?.slice(8) || idx + 1}
                  </span>
                  <span
                    className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      day.status === 'Present'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : day.status === 'Half-day'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                        : day.status === 'Leave'
                        ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/20'
                        : day.status === 'Weekend'
                        ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {day.status || 'Present'}
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

      {/* RECENT ACTIVITY & ALERTS DEDICATED SECTION */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recent Activity & Alerts
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personal event stream: punches, leave decisions, payslips & dossier updates
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {recentActivities.length} Events
          </span>
        </div>

        {loadingDashboard ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            Loading recent activity feed...
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            No recent activity recorded yet. Your punches, leave updates, and payslips will appear here.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-xs">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {act.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    {format(act.timestamp, 'dd MMM • hh:mm a')}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      act.statusColor === 'emerald'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                        : act.statusColor === 'rose'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25'
                        : act.statusColor === 'indigo'
                        ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25'
                    }`}
                  >
                    {act.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                    {act.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                    {act.status === 'Pending' && <Clock className="w-3 h-3" />}
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
