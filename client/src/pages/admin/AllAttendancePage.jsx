import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building,
  Laptop,
  Search,
  Filter,
  CalendarDays,
  Edit3,
  X,
  Save,
  Download,
  Check,
  TrendingUp,
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import demoAvatars from '../../utils/avatars';
import { format, subDays } from 'date-fns';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { FilterBar } from '../../components/ui/FilterBar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';

export const AllAttendancePage = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [department, setDepartment] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalPresent: 0, totalHalfDay: 0, totalLeave: 0 });
  const [loading, setLoading] = useState(true);
  const [density, setDensity] = useState('comfortable');

  // Edit record modal state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const fetchCompanyAttendance = async () => {
    try {
      setLoading(true);
      const params = { date: selectedDate };
      if (department !== 'All') params.department = department;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/attendance/all', { params });
      if (res.data.success) {
        setRecords(res.data.records || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load company attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyAttendance();
  }, [selectedDate, department, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanyAttendance();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSaving(true);
    try {
      const res = await api.put(`/attendance/${selectedRecord._id}`, {
        status: selectedRecord.status,
        totalHours: selectedRecord.totalHours,
        workMode: selectedRecord.workMode,
        remarks: selectedRecord.remarks,
      });

      if (res.data.success) {
        toast.success('Attendance record regularized successfully');
        setEditModalOpen(false);
        fetchCompanyAttendance();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Employee ID', 'Name', 'Department', 'Check In', 'Check Out', 'Total Hours', 'Work Mode', 'Status', 'Remarks'];
    const rows = records.map((r) => [
      r.date,
      r.userId?.employeeId || '',
      `"${r.userId?.name || ''}"`,
      `"${r.userId?.department || ''}"`,
      r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '',
      r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : '',
      r.totalHours || 0,
      r.workMode || 'Office',
      r.status,
      `"${r.remarks || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dayflow-attendance-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance records exported');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <Badge variant="success" dot size="xs">
            Present
          </Badge>
        );
      case 'Half-day':
        return (
          <Badge variant="warning" dot size="xs">
            Half-day
          </Badge>
        );
      case 'Leave':
        return (
          <Badge variant="purple" dot size="xs">
            On Leave
          </Badge>
        );
      default:
        return (
          <Badge variant="danger" dot size="xs">
            {status || 'Absent'}
          </Badge>
        );
    }
  };

  const activeFilters = [];
  if (department !== 'All') {
    activeFilters.push({
      key: 'dept',
      label: 'Dept',
      displayValue: department,
      onRemove: () => setDepartment('All'),
    });
  }
  if (statusFilter !== 'All') {
    activeFilters.push({
      key: 'status',
      label: 'Status',
      displayValue: statusFilter,
      onRemove: () => setStatusFilter('All'),
    });
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Company Attendance Roll Call
            </h1>
            <Badge variant="neutral" size="sm">
              {format(new Date(selectedDate), 'MMM do, yyyy')}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time punch verification, work modes (Office/Remote), shift hours, and record regularization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Date Presets */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                selectedDate === format(new Date(), 'yyyy-MM-dd')
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-subtle'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'))}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                selectedDate === format(subDays(new Date(), 1), 'yyyy-MM-dd')
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-subtle'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yesterday
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={exportCSV}
          >
            Export
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Present"
          value={stats.totalPresent}
          subtitle="Staff checked in"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
        />
        <StatCard
          title="Half-Day Shifts"
          value={stats.totalHalfDay}
          subtitle="Partial day records"
          icon={Clock}
          iconClassName="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60"
        />
        <StatCard
          title="Approved Leaves"
          value={stats.totalLeave}
          subtitle="Scheduled time off"
          icon={CalendarDays}
          iconClassName="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60"
        />
        <StatCard
          title="Records Logged"
          value={records.length}
          subtitle="Entries for this date"
          icon={Building}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter staff attendance by name, email, or ID..."
        filters={[
          {
            key: 'dept',
            label: 'Department',
            value: department,
            onChange: setDepartment,
            options: [
              { label: 'All Departments', value: 'All' },
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Product Design', value: 'Product Design' },
              { label: 'Sales & Marketing', value: 'Sales & Marketing' },
              { label: 'Human Resources', value: 'Human Resources' },
              { label: 'Finance', value: 'Finance' },
            ],
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Present', value: 'Present' },
              { label: 'Half-day', value: 'Half-day' },
              { label: 'Leave', value: 'Leave' },
              { label: 'Absent', value: 'Absent' },
            ],
          },
        ]}
        activeFilters={activeFilters}
        onClearAll={() => {
          setDepartment('All');
          setStatusFilter('All');
          setSearch('');
        }}
        density={density}
        onDensityChange={setDensity}
      />

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No attendance events found"
          description={`No punch logs recorded for ${format(new Date(selectedDate), 'MMMM do, yyyy')}.`}
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Employee</TableHead>
              <TableHead>Work Mode</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Logged Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r._id}>
                {/* Employee Info */}
                <TableCell density={density}>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.userId?.avatar || demoAvatars.generic(r.userId?.name)}
                      alt={r.userId?.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {r.userId?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {r.userId?.employeeId} • {r.userId?.department}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Work Mode */}
                <TableCell density={density}>
                  <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    {r.workMode === 'Remote' ? (
                      <Laptop className="w-3.5 h-3.5 text-sky-500" />
                    ) : (
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{r.workMode || 'Office'}</span>
                  </div>
                </TableCell>

                {/* Check In */}
                <TableCell density={density}>
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                    {r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '—'}
                  </span>
                </TableCell>

                {/* Check Out */}
                <TableCell density={density}>
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                    {r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : '—'}
                  </span>
                </TableCell>

                {/* Logged Hours */}
                <TableCell density={density}>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                    {r.totalHours ? `${r.totalHours} hrs` : 'In Progress'}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell density={density}>
                  {getStatusBadge(r.status)}
                </TableCell>

                {/* Remarks */}
                <TableCell density={density}>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] block">
                    {r.remarks || '—'}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell density={density} className="text-right">
                  <Button
                    variant="outline"
                    size="xs"
                    icon={Edit3}
                    onClick={() => {
                      setSelectedRecord(JSON.parse(JSON.stringify(r)));
                      setEditModalOpen(true);
                    }}
                  >
                    Regularize
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* REGULARIZE RECORD MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Regularize Attendance Record"
        subtitle={`Audit or override hours for ${selectedRecord?.userId?.name} on ${selectedDate}`}
        icon={Edit3}
        size="md"
      >
        {selectedRecord && (
          <form onSubmit={handleUpdateRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={selectedRecord.status}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, status: e.target.value })}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Present">Present</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Leave">Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Work Mode
                </label>
                <select
                  value={selectedRecord.workMode || 'Office'}
                  onChange={(e) => setSelectedRecord({ ...selectedRecord, workMode: e.target.value })}
                  className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Office">Office</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>

            <Input
              label="Total Shift Hours"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={selectedRecord.totalHours || ''}
              onChange={(e) =>
                setSelectedRecord({ ...selectedRecord, totalHours: parseFloat(e.target.value) || 0 })
              }
            />

            <Input
              label="Audit Remarks / Explanation"
              placeholder="e.g. Regularized per approved client onsite visit"
              value={selectedRecord.remarks || ''}
              onChange={(e) => setSelectedRecord({ ...selectedRecord, remarks: e.target.value })}
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={saving}
                icon={Save}
              >
                Save Adjustment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AllAttendancePage;
