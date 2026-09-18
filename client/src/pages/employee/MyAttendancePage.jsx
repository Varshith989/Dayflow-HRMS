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
} from 'lucide-react';
import CheckInOutWidget from '../../components/attendance/CheckInOutWidget';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { FilterBar } from '../../components/ui/FilterBar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';

export const MyAttendancePage = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState('comfortable');

  const toast = useToast();

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [weeklyRes, historyRes] = await Promise.all([
        api.get('/attendance/my-weekly'),
        api.get('/attendance/my-history?limit=30'),
      ]);

      if (weeklyRes.data.success) {
        setWeeklyData(weeklyRes.data.weeklyDays || weeklyRes.data.days || []);
      }
      if (historyRes.data.success) {
        setHistoryData(historyRes.data.records || []);
        setStats(historyRes.data.stats || null);
      }
    } catch (error) {
      toast.error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

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

  const filteredHistory = historyData.filter((rec) => {
    const matchesStatus = selectedStatus === 'All' || rec.status === selectedStatus;
    const matchesSearch =
      !search ||
      rec.date?.includes(search) ||
      rec.workMode?.toLowerCase().includes(search.toLowerCase()) ||
      rec.remarks?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeFilters = [];
  if (selectedStatus !== 'All') {
    activeFilters.push({
      key: 'status',
      label: 'Status',
      displayValue: selectedStatus,
      onRemove: () => setSelectedStatus('All'),
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Attendance & Punch Logs
            </h1>
            <Badge variant="brand" size="sm">
              Past 30 Days
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personal punch timestamps, shift duration calculations, and weekly compliance review.
          </p>
        </div>
      </div>

      {/* Top Strip: Widget & Monthly KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CheckInOutWidget onAttendanceUpdated={fetchAttendanceData} />
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Days Present"
            value={stats?.totalPresent || 0}
            subtitle="Full shifts logged"
            icon={CheckCircle2}
            iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
          />
          <StatCard
            title="Half-Day Shifts"
            value={stats?.totalHalfDay || 0}
            subtitle="Partial days"
            icon={Clock}
            iconClassName="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60"
          />
          <StatCard
            title="Time Off Taken"
            value={stats?.totalLeave || 0}
            subtitle="Approved leaves taken"
            icon={CalendarDays}
            iconClassName="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter logs by date (YYYY-MM-DD), work mode, remarks..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
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
          setSelectedStatus('All');
          setSearch('');
        }}
        density={density}
        onDensityChange={setDensity}
      />

      {/* History Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : filteredHistory.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No attendance entries found"
          description="Try adjusting your status filter or clearing your search."
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Work Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((rec) => (
              <TableRow key={rec._id}>
                {/* Date */}
                <TableCell density={density}>
                  <div className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {rec.date ? format(new Date(rec.date), 'EEE, MMM dd, yyyy') : '—'}
                  </div>
                </TableCell>

                {/* Check In */}
                <TableCell density={density}>
                  <span className="font-mono text-xs text-slate-800 dark:text-slate-200 tabular-nums">
                    {rec.checkIn ? format(new Date(rec.checkIn), 'hh:mm a') : '—'}
                  </span>
                </TableCell>

                {/* Check Out */}
                <TableCell density={density}>
                  <span className="font-mono text-xs text-slate-800 dark:text-slate-200 tabular-nums">
                    {rec.checkOut ? format(new Date(rec.checkOut), 'hh:mm a') : '—'}
                  </span>
                </TableCell>

                {/* Total Hours */}
                <TableCell density={density}>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                    {rec.totalHours ? `${rec.totalHours} hrs` : 'In Progress'}
                  </span>
                </TableCell>

                {/* Work Mode */}
                <TableCell density={density}>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    {rec.workMode === 'Remote' ? (
                      <Laptop className="w-3.5 h-3.5 text-sky-500" />
                    ) : (
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{rec.workMode || 'Office'}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell density={density}>
                  {getStatusBadge(rec.status)}
                </TableCell>

                {/* Remarks */}
                <TableCell density={density}>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {rec.remarks || 'Standard working day'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default MyAttendancePage;
