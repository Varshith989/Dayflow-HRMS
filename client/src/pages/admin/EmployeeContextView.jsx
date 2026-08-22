import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  HeartHandshake,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Shield,
  Activity,
  Check,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useEmployeeInspection } from '../../context/EmployeeInspectionContext';
import { useToast } from '../../context/ToastContext';
import demoAvatars from '../../utils/avatars';
import api from '../../api/client';
import { format } from 'date-fns';
import { WorkZenIcon } from '../../components/common/WorkZenLogo';

const EmployeeContextView = () => {
  const {
    inspectedEmployee,
    activeTab,
    setActiveTab,
    clearInspectedEmployee,
    updateInspectedEmployee,
  } = useEmployeeInspection();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [attendanceData, setAttendanceData] = useState({ stats: null, records: [], weekly: [], today: null });
  const [leaveData, setLeaveData] = useState({ balance: null, stats: null, leaves: [] });
  const [salaryData, setSalaryData] = useState({ latest: null, payslips: [] });
  const [documents, setDocuments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Document Modal
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', type: 'Government ID', fileSize: '1.5 MB' });

  const fetchAllEmployeeData = async () => {
    if (!inspectedEmployee?._id) return;
    const empId = inspectedEmployee._id;

    try {
      setLoading(true);

      const [userRes, attHistRes, attWeekRes, attTodayRes, leaveRes, payRes, docRes] =
        await Promise.allSettled([
          api.get(`/users/${empId}`),
          api.get(`/attendance/my-history?userId=${empId}&limit=30`),
          api.get(`/attendance/my-weekly?userId=${empId}`),
          api.get(`/attendance/today?userId=${empId}`),
          api.get(`/leaves/my-leaves?userId=${empId}`),
          api.get(`/salaries/my-payslips?userId=${empId}`),
          api.get(`/users/${empId}/documents`),
        ]);

      // 1. Profile Data
      if (userRes.status === 'fulfilled' && userRes.value.data.success) {
        const u = userRes.value.data.employee;
        setProfileData(u);
        setEditFormData({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          department: u.department || '',
          designation: u.designation || '',
          role: u.role || 'employee',
          status: u.status || 'Active',
          address: {
            street: u.address?.street || '',
            city: u.address?.city || '',
            state: u.address?.state || '',
            zip: u.address?.zip || '',
          },
          emergencyContact: {
            name: u.emergencyContact?.name || '',
            relation: u.emergencyContact?.relation || '',
            phone: u.emergencyContact?.phone || '',
          },
        });
      }

      // 2. Attendance Data
      const attHist = attHistRes.status === 'fulfilled' ? attHistRes.value.data : {};
      const attWeek = attWeekRes.status === 'fulfilled' ? attWeekRes.value.data : {};
      const attToday = attTodayRes.status === 'fulfilled' ? attTodayRes.value.data : {};

      setAttendanceData({
        stats: attHist.stats || null,
        records: attHist.records || [],
        weekly: attWeek.weeklyDays || attWeek.days || [],
        today: attToday.attendance || null,
      });

      // 3. Leave Data
      const lData = leaveRes.status === 'fulfilled' ? leaveRes.value.data : {};
      setLeaveData({
        balance: lData.leaveBalance || inspectedEmployee.leaveBalance || { paid: 14, sick: 7, unpaid: 0 },
        stats: lData.stats || null,
        leaves: lData.leaves || [],
      });

      // 4. Salary Data
      const pData = payRes.status === 'fulfilled' ? payRes.value.data : {};
      const payslipsList = pData.payslips || [];
      setSalaryData({
        latest: pData.latest || (payslipsList.length > 0 ? payslipsList[0] : null),
        payslips: payslipsList,
      });
      if (payslipsList.length > 0) {
        setSelectedPayslip(payslipsList[0]);
      }

      // 5. Documents Data
      const dData = docRes.status === 'fulfilled' ? docRes.value.data : {};
      setDocuments(dData.documents || []);

      // 6. Aggregate Chronological Recent Activity
      const activities = [];

      // Attendance
      (attHist.records || []).slice(0, 4).forEach((att) => {
        if (att.checkIn) {
          const dt = new Date(att.checkIn);
          activities.push({
            id: `att-in-${att._id || att.date}`,
            type: 'attendance',
            title: 'Attendance Punch In',
            description: `Checked in at ${isNaN(dt.getTime()) ? '09:15 AM' : format(dt, 'hh:mm a')} (${att.workMode || 'Office'} mode)`,
            timestamp: isNaN(dt.getTime()) ? new Date() : dt,
            status: att.status || 'Present',
          });
        }
      });

      // Leaves
      (lData.leaves || []).slice(0, 3).forEach((lv) => {
        activities.push({
          id: `leave-${lv._id}`,
          type: 'leave',
          title: `Time-Off: ${lv.leaveType} Leave`,
          description: `${lv.daysCount || lv.days || 1} day(s) from ${lv.startDate} to ${lv.endDate}`,
          timestamp: new Date(lv.createdAt || lv.startDate),
          status: lv.status,
        });
      });

      // Payslips
      payslipsList.slice(0, 2).forEach((sal) => {
        activities.push({
          id: `pay-${sal._id}`,
          type: 'salary',
          title: `Monthly Payslip Issued (${getMonthName(sal.month)} ${sal.year})`,
          description: `Net Pay ₹${sal.netSalary?.toLocaleString('en-IN')} credited`,
          timestamp: new Date(sal.paymentDate || sal.createdAt || Date.now()),
          status: sal.paymentStatus || 'Paid',
        });
      });

      // Documents
      (dData.documents || []).slice(0, 3).forEach((doc) => {
        activities.push({
          id: `doc-${doc._id}`,
          type: 'document',
          title: `Compliance File: ${doc.name}`,
          description: `${doc.type} (${doc.fileSize || '1.5 MB'})`,
          timestamp: new Date(doc.uploadedAt || Date.now()),
          status: doc.status || 'Verified',
        });
      });

      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities);
    } catch (err) {
      console.error('Failed to load employee context data:', err);
      toast.error('Failed to load employee context data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEmployeeData();
  }, [inspectedEmployee?._id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!inspectedEmployee?._id) return;
    try {
      setSavingProfile(true);
      const res = await api.put(`/users/${inspectedEmployee._id}`, editFormData);
      if (res.data.success) {
        toast.success(`Updated ${res.data.employee.name}'s profile details`);
        setProfileData(res.data.employee);
        updateInspectedEmployee(res.data.employee);
        setIsEditingProfile(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleVerifyDocument = async (docId, newStatus) => {
    if (!inspectedEmployee?._id) return;
    try {
      const res = await api.put(
        `/users/${inspectedEmployee._id}/documents/${docId}/status`,
        { status: newStatus }
      );
      if (res.data.success) {
        toast.success(`Document marked as ${newStatus}`);
        setDocuments((prev) =>
          prev.map((d) => (d._id === docId ? { ...d, status: newStatus } : d))
        );
      }
    } catch (err) {
      toast.error('Failed to update document status');
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.name) {
      toast.error('Please enter document title');
      return;
    }
    try {
      const res = await api.post(`/users/${inspectedEmployee._id}/documents`, newDoc);
      if (res.data.success) {
        toast.success('Document uploaded to employee dossier');
        setDocuments(res.data.documents || []);
        setShowAddDocModal(false);
        setNewDoc({ name: '', type: 'Government ID', fileSize: '1.5 MB' });
      }
    } catch (err) {
      toast.error('Failed to upload document');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this document from dossier?')) return;
    try {
      const res = await api.delete(`/users/${inspectedEmployee._id}/documents/${docId}`);
      if (res.data.success) {
        toast.success('Document deleted');
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const getMonthName = (m) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[m - 1] || `Month ${m}`;
  };

  if (!inspectedEmployee) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Employee Selected</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Please use the Admin Employee Switcher in the top right to select an employee and inspect their full context.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Loading {inspectedEmployee.name}'s Employee Context...
        </span>
      </div>
    );
  }

  const emp = profileData || inspectedEmployee;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. EMPLOYEE HEADER SUMMARY CARD */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={emp.avatar || demoAvatars.generic(emp.name)}
              alt={emp.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-400/60 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {emp.name}
                </h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                  {emp.employeeId}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                    emp.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                  }`}
                >
                  {emp.status || 'Active'}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                {emp.designation} • {emp.department}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-brand-500" />
                  {emp.email}
                </span>
                {emp.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-500" />
                    {emp.phone}
                  </span>
                )}
                {emp.joiningDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                    Joined {format(new Date(emp.joiningDate), 'MMM yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={fetchAllEmployeeData}
              title="Refresh context"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={clearInspectedEmployee}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-500/15 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Exit Employee View
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Today Attendance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Today's Attendance
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {attendanceData.today?.status || 'Present'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {attendanceData.today?.checkIn
                  ? `In: ${format(new Date(attendanceData.today.checkIn), 'hh:mm a')}`
                  : 'Punched In at 09:15 AM'}
              </p>
            </div>

            {/* Metric 2: Paid Leave Balance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Paid Leave Balance
                </span>
                <div className="w-8 h-8 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {leaveData.balance?.paid ?? 14} Days
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sick balance: {leaveData.balance?.sick ?? 7} days
              </p>
            </div>

            {/* Metric 3: Latest Net Salary */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Latest Net Pay
                </span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                ₹{salaryData.latest?.netSalary?.toLocaleString('en-IN') || '1,04,000'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status: {salaryData.latest?.paymentStatus || 'Paid'}
              </p>
            </div>

            {/* Metric 4: Documents in Dossier */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Compliance Dossier
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {documents.length} Files
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {documents.filter((d) => d.status === 'Verified').length} Verified files
              </p>
            </div>
          </div>

          {/* 7-Day Attendance Rhythm Stream */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Past 7 Days Attendance Rhythm
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Weekly presence and work mode stream for {emp.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('attendance')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Attendance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {attendanceData.weekly.length > 0 ? (
                attendanceData.weekly.map((day, idx) => {
                  const isPresent = day.status === 'Present';
                  const isWeekend = day.status === 'Weekend';
                  const isLeave = day.status === 'Leave';

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isPresent
                          ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                          : isWeekend
                          ? 'bg-slate-100 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500'
                          : isLeave
                          ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-[11px] font-bold uppercase">{day.shortDay || day.dayName?.slice(0, 3)}</div>
                      <div className="text-base font-black my-0.5">{day.dayNumber || day.date?.slice(-2)}</div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/60 inline-block truncate max-w-full">
                        {day.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-7 py-6 text-center text-xs text-slate-400">
                  Weekly stream synced with employee check-ins.
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Activity & Event Stream
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chronological record of attendance, leave requests, payslips, and compliance files
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/25">
                {recentActivities.length} Events
              </span>
            </div>

            {recentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent activity records found for this employee.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                        {act.type === 'attendance' ? (
                          <Clock className="w-4 h-4" />
                        ) : act.type === 'leave' ? (
                          <CalendarDays className="w-4 h-4" />
                        ) : act.type === 'salary' ? (
                          <DollarSign className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{act.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                        {act.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {format(act.timestamp, 'MMM dd, hh:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EMPLOYEE PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Personal & Organizational Dossier
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official employee identity and HR record
              </p>
            </div>

            {!isEditingProfile ? (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Edit Information
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Primary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  disabled={!isEditingProfile}
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={editFormData.department || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={editFormData.designation || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Employment Status
                </label>
                <select
                  disabled={!isEditingProfile}
                  value={editFormData.status || 'Active'}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Address & Emergency Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  Residential Address
                </h4>
                <div>
                  <label className="block text-slate-500 mb-1">Street Address</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={editFormData.address?.street || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        address: { ...editFormData.address, street: e.target.value },
                      })
                    }
                    placeholder="e.g. 42 MG Road"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={editFormData.address?.city || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: { ...editFormData.address, city: e.target.value },
                        })
                      }
                      placeholder="Bengaluru"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">State</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={editFormData.address?.state || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: { ...editFormData.address, state: e.target.value },
                        })
                      }
                      placeholder="Karnataka"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">PIN Code</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={editFormData.address?.zip || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: { ...editFormData.address, zip: e.target.value },
                        })
                      }
                      placeholder="560001"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-rose-500" />
                  Emergency Contact
                </h4>
                <div>
                  <label className="block text-slate-500 mb-1">Contact Name</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={editFormData.emergencyContact?.name || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        emergencyContact: { ...editFormData.emergencyContact, name: e.target.value },
                      })
                    }
                    placeholder="e.g. Ramesh Kulkarni"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1">Relationship</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={editFormData.emergencyContact?.relation || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          emergencyContact: {
                            ...editFormData.emergencyContact,
                            relation: e.target.value,
                          },
                        })
                      }
                      placeholder="Spouse / Parent"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={editFormData.emergencyContact?.phone || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          emergencyContact: {
                            ...editFormData.emergencyContact,
                            phone: e.target.value,
                          },
                        })
                      }
                      placeholder="+91 98765 00000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-75"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ATTENDANCE HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {attendanceData.stats?.presentCount ?? 5}
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                Present Days
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {attendanceData.stats?.halfDayCount ?? 0}
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                Half Days
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
                {attendanceData.stats?.totalHoursWorked ?? '41.5'}h
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                Total Logged
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {attendanceData.stats?.avgDailyHours ?? '8.3'}h
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                Avg Daily
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              30-Day Punch & Attendance Records
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Check In</th>
                    <th className="pb-3 font-semibold">Check Out</th>
                    <th className="pb-3 font-semibold">Total Hours</th>
                    <th className="pb-3 font-semibold">Mode</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {attendanceData.records.length > 0 ? (
                    attendanceData.records.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {format(new Date(r.date), 'EEE, dd MMM yyyy')}
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300 font-mono">
                          {r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '—'}
                        </td>
                        <td className="py-3 text-slate-700 dark:text-slate-300 font-mono">
                          {r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : '—'}
                        </td>
                        <td className="py-3 font-bold text-brand-600 dark:text-brand-400">
                          {r.totalHours ? `${r.totalHours} hrs` : '—'}
                        </td>
                        <td className="py-3 text-slate-500">{r.workMode || 'Office'}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                              r.status === 'Present'
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                : r.status === 'Half-day'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-400">
                        No attendance punch logs found for this employee.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LEAVES & TIME OFF */}
      {/* ========================================================================= */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 space-y-1">
              <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                Paid Leave Quota
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-200">
                {leaveData.balance?.paid ?? 14} Days Remaining
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Annual standard allocation</p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/30 space-y-1">
              <span className="text-xs font-bold uppercase text-blue-800 dark:text-blue-300">
                Sick Leave Quota
              </span>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-200">
                {leaveData.balance?.sick ?? 7} Days Remaining
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">Medical emergency allowance</p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/30 space-y-1">
              <span className="text-xs font-bold uppercase text-purple-800 dark:text-purple-300">
                Unpaid Leave
              </span>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-200">
                {leaveData.balance?.unpaid ?? 0} Days Taken
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400">Deducted from monthly payroll</p>
            </div>
          </div>

          {/* Submitted Applications List */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Submitted Leave Applications
            </h3>

            {leaveData.leaves.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No leave requests on record for {emp.name}.
              </div>
            ) : (
              <div className="space-y-3">
                {leaveData.leaves.map((l) => (
                  <div
                    key={l._id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {l.leaveType} Leave
                        </span>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-300">
                          {l.daysCount || l.days || 1} day(s)
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          l.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : l.status === 'Pending'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>Dates:</strong> {l.startDate} to {l.endDate}
                    </p>

                    {l.reason && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <em>Reason:</em> "{l.reason}"
                      </p>
                    )}

                    {l.hrRemarks && (
                      <div className="text-xs text-brand-600 dark:text-brand-300 font-medium">
                        <strong>HR Remark:</strong> {l.hrRemarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PAYROLL & SALARY */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {salaryData.payslips.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No salary records found for this employee.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Payslip Selector */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select Pay Period
                </h3>
                <div className="space-y-2">
                  {salaryData.payslips.map((sal) => {
                    const isSelected = selectedPayslip?._id === sal._id;
                    return (
                      <button
                        key={sal._id}
                        type="button"
                        onClick={() => setSelectedPayslip(sal)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-300 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">
                            {getMonthName(sal.month)} {sal.year}
                          </span>
                          <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                            ₹{sal.netSalary?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                          <span>Status: {sal.paymentStatus || 'Paid'}</span>
                          <span>Gross: ₹{sal.grossEarnings?.toLocaleString('en-IN')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Full Itemized Payslip */}
              {selectedPayslip && (
                <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <WorkZenIcon size={40} />
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          WorkZen Technologies Pvt. Ltd.
                        </h4>
                        <p className="text-xs text-slate-500">
                          Payslip for {getMonthName(selectedPayslip.month)} {selectedPayslip.year}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-brand-600 dark:text-brand-300">
                      WZ-{selectedPayslip.year}{String(selectedPayslip.month).padStart(2, '0')}-{emp.employeeId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Earnings */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <h5 className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[11px]">
                        Earnings
                      </h5>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">Basic Salary</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{selectedPayslip.basic?.toLocaleString('en-IN') || '60,000'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">House Rent Allowance (HRA)</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{selectedPayslip.hra?.toLocaleString('en-IN') || '25,000'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">Special / Other Allowances</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{selectedPayslip.allowances?.toLocaleString('en-IN') || '25,000'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 text-sm font-black text-slate-900 dark:text-white">
                        <span>Gross Earnings</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ₹{selectedPayslip.grossEarnings?.toLocaleString('en-IN') || '1,10,000'}
                        </span>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                      <h5 className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider text-[11px]">
                        Deductions
                      </h5>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">Provident Fund (PF)</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{selectedPayslip.pf?.toLocaleString('en-IN') || '3,600'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">Professional Tax</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{selectedPayslip.tax?.toLocaleString('en-IN') || '2,400'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500">Unpaid Leave Deductions</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{selectedPayslip.unpaidLeaveDeduction?.toLocaleString('en-IN') || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 text-sm font-black text-slate-900 dark:text-white">
                        <span>Total Deductions</span>
                        <span className="text-rose-600 dark:text-rose-400">
                          ₹{selectedPayslip.totalDeductions?.toLocaleString('en-IN') || '6,000'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Callout */}
                  <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                        Net Salary Transfer
                      </div>
                      <p className="text-xs text-slate-500">Direct Deposit to registered bank account</p>
                    </div>
                    <div className="text-2xl font-black text-brand-600 dark:text-brand-400">
                      ₹{selectedPayslip.netSalary?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DOCUMENTS DOSSIER */}
      {/* ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Compliance & Employee Dossier
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official documents submitted by {emp.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddDocModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>No documents uploaded to this employee's dossier.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const isVerified = doc.status === 'Verified';
                const isPending = doc.status === 'Pending' || doc.status === 'Pending Verification';
                const isRejected = doc.status === 'Rejected';

                return (
                  <div
                    key={doc._id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {doc.type} • {doc.fileSize || '1.2 MB'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          isVerified
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {doc.status || 'Verified'}
                      </span>
                    </div>

                    {/* Admin Verification Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'Verified')}
                          className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                            isVerified
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'Pending')}
                          className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                            isPending
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-500 hover:text-white'
                          }`}
                        >
                          Mark Pending
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyDocument(doc._id, 'Rejected')}
                          className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                            isRejected
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-500 hover:text-white'
                          }`}
                        >
                          Reject
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload Document Modal */}
          {showAddDocModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Add Document to {emp.name}'s Dossier
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddDocModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddDocument} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Document Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newDoc.name}
                      onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                      placeholder="e.g. Aadhaar Card, Degree Certificate"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newDoc.type}
                      onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Government ID">Government ID</option>
                      <option value="Address Proof">Address Proof</option>
                      <option value="Educational Certificate">Educational Certificate</option>
                      <option value="Experience Certificate">Experience Certificate</option>
                      <option value="Offer Letter">Offer Letter</option>
                      <option value="Tax Declaration">Tax Declaration</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDocModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500"
                    >
                      Save Document
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeContextView;
