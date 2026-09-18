import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  MessageSquare,
} from 'lucide-react';
import ApplyLeaveModal from '../../components/leave/ApplyLeaveModal';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { FilterBar } from '../../components/ui/FilterBar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';

export const MyLeavesPage = () => {
  const { user, updateUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(user?.leaveBalance || { paid: 14, sick: 7, unpaid: 0 });
  const [stats, setStats] = useState({ totalApplications: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [density, setDensity] = useState('comfortable');

  const toast = useToast();

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/my-leaves');
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
        if (res.data.leaveBalance) {
          setLeaveBalance(res.data.leaveBalance);
          updateUser({ leaveBalance: res.data.leaveBalance });
        }
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (error) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <Badge variant="success" dot size="xs">
            Approved
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge variant="danger" dot size="xs">
            Rejected
          </Badge>
        );
      case 'Pending':
      default:
        return (
          <Badge variant="warning" dot size="xs">
            Pending Review
          </Badge>
        );
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus = selectedStatus === 'All' || l.status === selectedStatus;
    const matchesSearch =
      !search ||
      l.reason?.toLowerCase().includes(search.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(search.toLowerCase()) ||
      l.startDate?.includes(search);
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
              Time Off & Leave Portal
            </h1>
            <Badge variant="brand" size="sm">
              Annual Quota 2026
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Submit leave applications, track managerial review status, and review remaining balances.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setModalOpen(true)}
        >
          Apply for Time Off
        </Button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Paid Vacation Quota"
          value={leaveBalance.paid}
          subtitle="Days available this cycle"
          icon={CalendarDays}
          iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
        />

        <StatCard
          title="Sick Leave Quota"
          value={leaveBalance.sick}
          subtitle="Medical emergency days"
          icon={CalendarDays}
          iconClassName="bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 border-brand-200/60 dark:border-brand-800/60"
        />

        <StatCard
          title="Unpaid Days Taken"
          value={leaveBalance.unpaid}
          subtitle="Loss-of-pay leaves"
          icon={Clock}
        />

        <StatCard
          title="Pending Requests"
          value={stats.pending || 0}
          subtitle="Awaiting manager sign-off"
          icon={Clock}
          iconClassName="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60"
          badge={stats.pending > 0 ? 'Under Review' : 'Zero Pending'}
          badgeVariant={stats.pending > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter leaves by reason, type, or date..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Rejected', value: 'Rejected' },
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

      {/* Applications Table */}
      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : filteredLeaves.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No leave applications found"
          description="You have not submitted any leave requests matching your current filter."
          action={
            <Button
              variant="primary"
              size="xs"
              icon={Plus}
              onClick={() => setModalOpen(true)}
            >
              Apply for Time Off
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Manager Feedback</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredLeaves.map((l) => (
              <TableRow key={l._id}>
                {/* Leave Type */}
                <TableCell density={density}>
                  <Badge variant={l.leaveType === 'Paid' ? 'success' : l.leaveType === 'Sick' ? 'brand' : 'neutral'} size="xs">
                    {l.leaveType} Leave
                  </Badge>
                </TableCell>

                {/* Dates */}
                <TableCell density={density}>
                  <span className="font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200">
                    {l.startDate}
                  </span>
                </TableCell>

                <TableCell density={density}>
                  <span className="font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200">
                    {l.endDate}
                  </span>
                </TableCell>

                {/* Duration */}
                <TableCell density={density}>
                  <span className="font-bold text-xs tabular-nums text-slate-900 dark:text-white">
                    {l.daysCount} day{l.daysCount > 1 ? 's' : ''}
                  </span>
                </TableCell>

                {/* Reason */}
                <TableCell density={density}>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-xs block font-medium">
                    "{l.reason}"
                  </span>
                </TableCell>

                {/* Admin Comment */}
                <TableCell density={density}>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-xs block">
                    {l.adminComment || '—'}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell density={density} className="text-right">
                  {getStatusBadge(l.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLeaveSubmitted={fetchMyLeaves}
      />
    </div>
  );
};

export default MyLeavesPage;
