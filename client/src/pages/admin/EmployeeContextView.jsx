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
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Printer,
  Edit2,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { useEmployeeInspection } from '../../context/EmployeeInspectionContext';
import { useToast } from '../../context/ToastContext';
import demoAvatars from '../../utils/avatars';
import api from '../../api/client';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { DayflowLogo } from '../../components/common/DayflowLogo';

export const EmployeeContextView = () => {
  const {
    inspectedEmployee,
    activeTab,
    setActiveTab,
    clearInspectedEmployee,
    updateInspectedEmployee,
  } = useEmployeeInspection();
  const toast = useToast();
  const navigate = useNavigate();

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

      // 6. Aggregate Recent Activity
      const activities = [];
      (attHist.records || []).slice(0, 4).forEach((att) => {
        if (att.checkIn) {
          const dt = new Date(att.checkIn);
          activities.push({
            id: `att-${att._id}`,
            title: 'Attendance Clock-In',
            description: `Clocked in at ${format(dt, 'hh:mm a')} (${att.workMode || 'Office'})`,
            timestamp: dt,
            badge: att.status,
            badgeVariant: 'success',
          });
        }
      });
      (lData.leaves || []).slice(0, 3).forEach((lv) => {
        activities.push({
          id: `leave-${lv._id}`,
          title: `Leave Application (${lv.leaveType})`,
          description: `${lv.startDate} to ${lv.endDate} (${lv.daysCount} days)`,
          timestamp: new Date(lv.createdAt || Date.now()),
          badge: lv.status,
          badgeVariant: lv.status === 'Approved' ? 'success' : lv.status === 'Rejected' ? 'danger' : 'warning',
        });
      });
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivities(activities.slice(0, 5));
    } catch (err) {
      console.error('Error fetching employee 360 context:', err);
      toast.error('Failed to load employee 360 profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEmployeeData();
  }, [inspectedEmployee?._id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put(`/users/${inspectedEmployee._id}`, editFormData);
      if (res.data.success) {
        toast.success('Employee profile updated successfully');
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

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!newDoc.name) {
      toast.error('Please enter a document title');
      return;
    }
    try {
      const res = await api.post(`/users/${inspectedEmployee._id}/documents`, newDoc);
      if (res.data.success) {
        toast.success('Document uploaded');
        setDocuments(res.data.documents || []);
        setShowAddDocModal(false);
        setNewDoc({ name: '', type: 'Government ID', fileSize: '1.5 MB' });
      }
    } catch (err) {
      toast.error('Failed to upload document');
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const res = await api.delete(`/users/${inspectedEmployee._id}/documents/${docId}`);
      if (res.data.success) {
        toast.success('Document removed');
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleVerifyDocument = async (docId, status) => {
    try {
      const res = await api.put(`/users/${inspectedEmployee._id}/documents/${docId}/status`, { status });
      if (res.data.success) {
        toast.success(`Document marked as ${status}`);
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      toast.error('Failed to verify document');
    }
  };

  if (!inspectedEmployee) {
    return (
      <EmptyState
        icon={User}
        title="No employee selected for 360° inspection"
        description="Select an employee from the directory or use the switcher in the navigation bar to inspect their complete record."
        action={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/employees')}
          >
            Go to Employee Directory
          </Button>
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 360 Header Profile Card */}
      <div className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={profileData?.avatar || demoAvatars.generic(profileData?.name)}
            alt={profileData?.name}
            className="w-14 h-14 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {profileData?.name}
              </h1>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {profileData?.employeeId}
              </span>
              <Badge variant={profileData?.status === 'Active' ? 'success' : 'danger'} dot size="xs">
                {profileData?.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {profileData?.designation} • {profileData?.department} • Joined {profileData?.joiningDate ? format(new Date(profileData.joiningDate), 'MMM yyyy') : 'Recently'}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {profileData?.email}
              </span>
              {profileData?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {profileData?.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={Edit2}
            onClick={() => {
              setIsEditingProfile(true);
              setActiveTab('profile');
            }}
          >
            Edit Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearInspectedEmployee}
          >
            Close View
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'profile', label: 'Employment & Personal', icon: User },
          { id: 'attendance', label: 'Attendance Logs', icon: Clock },
          { id: 'leaves', label: 'Time Off & Leaves', icon: CalendarDays },
          { id: 'payroll', label: 'Compensation & Payroll', icon: DollarSign },
          { id: 'documents', label: 'Compliance Documents', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title="Paid Leaves Left"
              value={leaveData.balance?.paid ?? 14}
              subtitle="Days available"
              icon={CalendarDays}
              iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
            />
            <StatCard
              title="Sick Leaves Left"
              value={leaveData.balance?.sick ?? 7}
              subtitle="Medical allowance"
              icon={CalendarDays}
              iconClassName="bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 border-brand-200/60 dark:border-brand-800/60"
            />
            <StatCard
              title="Attendance Shifts"
              value={attendanceData.records.length}
              subtitle="Logged in past 30d"
              icon={Clock}
            />
            <StatCard
              title="Net Monthly Salary"
              value={salaryData.latest ? `₹${salaryData.latest.netSalary.toLocaleString('en-IN')}` : '₹78,500'}
              subtitle="Latest processed slip"
              icon={CreditCard}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Employment Summary */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Staff Credentials & Role
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Staff ID</span>
                  <span className="font-mono font-semibold">{profileData?.employeeId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">System Role</span>
                  <Badge variant={profileData?.role === 'admin' ? 'warning' : 'brand'} size="xs">
                    {profileData?.role}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department</span>
                  <span className="font-medium">{profileData?.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Designation</span>
                  <span className="font-medium">{profileData?.designation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">City</span>
                  <span className="font-medium">{profileData?.address?.city || 'Bengaluru'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Verification</span>
                  <Badge variant="success" dot size="xs">
                    Verified
                  </Badge>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                Recent Employee Activity
              </h3>
              {recentActivities.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">No events logged.</div>
              ) : (
                <div className="space-y-2 text-xs">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{act.title}</div>
                        <div className="text-[11px] text-slate-500">{act.description}</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {format(act.timestamp, 'MMM dd')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE / EMPLOYMENT */}
      {activeTab === 'profile' && (
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Personal & Employment Records
              </h3>
              <p className="text-xs text-slate-500">Official organizational details and emergency contacts</p>
            </div>
            {!isEditingProfile && (
              <Button
                variant="secondary"
                size="xs"
                icon={Edit2}
                onClick={() => setIsEditingProfile(true)}
              >
                Edit Records
              </Button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <Input
                  label="Full Name"
                  required
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
                <Input
                  label="Work Email"
                  type="email"
                  required
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <select
                    value={editFormData.department || 'General'}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Sales & Marketing">Sales & Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <Input
                  label="Designation"
                  value={editFormData.designation || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={editFormData.status || 'Active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={savingProfile}
                  icon={Save}
                >
                  Save Profile
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Employment Data
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Department</span>
                    <span className="font-medium">{profileData?.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Designation</span>
                    <span className="font-medium">{profileData?.designation}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Joining Date</span>
                    <span className="font-medium">
                      {profileData?.joiningDate ? format(new Date(profileData.joiningDate), 'MMMM do, yyyy') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">System Role</span>
                    <Badge variant="brand" size="xs">
                      {profileData?.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Emergency Contacts & Address
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Contact Name</span>
                    <span className="font-medium">{profileData?.emergencyContact?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Relationship</span>
                    <span className="font-medium">{profileData?.emergencyContact?.relation || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Phone</span>
                    <span className="font-medium">{profileData?.emergencyContact?.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">City / State</span>
                    <span className="font-medium">
                      {profileData?.address?.city || 'Bengaluru'}, {profileData?.address?.state || 'Karnataka'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Hours Logged</TableHead>
                <TableHead>Work Mode</TableHead>
                <TableHead>Status</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {attendanceData.records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                    No attendance logs recorded for this employee.
                  </TableCell>
                </TableRow>
              ) : (
                attendanceData.records.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {r.date ? format(new Date(r.date), 'EEE, MMM dd, yyyy') : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                        {r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                        {r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-xs tabular-nums text-slate-900 dark:text-white">
                        {r.totalHours ? `${r.totalHours} hrs` : 'In Progress'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-700 dark:text-slate-300">{r.workMode || 'Office'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'Present' ? 'success' : r.status === 'Half-day' ? 'warning' : 'danger'} dot size="xs">
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 4. LEAVES */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Review Comment</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {leaveData.leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                    No leave requests found for this employee.
                  </TableCell>
                </TableRow>
              ) : (
                leaveData.leaves.map((l) => (
                  <TableRow key={l._id}>
                    <TableCell>
                      <Badge variant={l.leaveType === 'Paid' ? 'success' : 'brand'} size="xs">
                        {l.leaveType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold tabular-nums">{l.daysCount} days</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs tabular-nums">
                        {l.startDate} to {l.endDate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        "{l.reason}"
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={l.status === 'Approved' ? 'success' : l.status === 'Rejected' ? 'danger' : 'warning'} dot size="xs">
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-slate-400 italic">
                        {l.adminComment || '—'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 5. PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Period</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>HRA & Allowances</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {salaryData.payslips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-slate-400">
                    No payroll slips generated for this employee.
                  </TableCell>
                </TableRow>
              ) : (
                salaryData.payslips.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Month {p.month}, {p.year}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs tabular-nums">
                        ₹{p.basicSalary.toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs tabular-nums">
                        ₹{(p.hra + p.allowances).toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold tabular-nums">
                        ₹{p.grossSalary.toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ₹{p.netSalary.toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" dot size="xs">
                        {p.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="xs"
                        icon={Printer}
                        onClick={() => window.print()}
                      >
                        Print Slip
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 6. DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Compliance & Identification Documents
              </h3>
              <p className="text-[11px] text-slate-400">Employee legal proof and verified credentials</p>
            </div>
            <Button
              variant="primary"
              size="xs"
              icon={Plus}
              onClick={() => setShowAddDocModal(true)}
            >
              Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-slate-500">
                No documents uploaded for this employee yet.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc._id}
                  className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {doc.type} • {doc.fileSize || '1.2 MB'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleVerifyDocument(
                          doc._id,
                          doc.status === 'Verified' ? 'Pending Verification' : 'Verified'
                        )
                      }
                      title="Click to toggle verification"
                    >
                      <Badge
                        variant={doc.status === 'Verified' ? 'success' : 'warning'}
                        dot
                        size="xs"
                        className="cursor-pointer"
                      >
                        {doc.status}
                      </Badge>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      <Modal
        isOpen={showAddDocModal}
        onClose={() => setShowAddDocModal(false)}
        title="Upload Compliance Document"
        subtitle={`Add identity record for ${inspectedEmployee.name}`}
        icon={FileText}
        size="md"
      >
        <form onSubmit={handleAddDocument} className="space-y-4 text-xs">
          <Input
            label="Document Title"
            required
            placeholder="e.g. Government Aadhaar / PAN Card"
            value={newDoc.name}
            onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Document Category
            </label>
            <select
              value={newDoc.type}
              onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
              className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Government ID">Government ID</option>
              <option value="Tax Document">Tax Document</option>
              <option value="Offer Letter">Offer Letter</option>
              <option value="Certificate">Certificate</option>
              <option value="Compliance">Compliance</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddDocModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={Plus}
            >
              Save Document
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeContextView;
