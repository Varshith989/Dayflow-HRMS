import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  MessageSquare,
  Building,
  User,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import demoAvatars from '../../utils/avatars';
import { format } from 'date-fns';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { FilterBar } from '../../components/ui/FilterBar';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/Skeleton';

export const LeaveApprovalPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [department, setDepartment] = useState('All');
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState('comfortable');

  // Decision Modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decisionType, setDecisionType] = useState('Approved');
  const [adminComment, setAdminComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (department !== 'All') params.department = department;
      if (search) params.search = search;

      const res = await api.get('/leaves/all', { params });
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const isFirstMount = useRef(true);

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, department]);

  // Debounced search
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchLeaves();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const openDecisionModal = (leave, type) => {
    setSelectedLeave(leave);
    setDecisionType(type);
    setAdminComment(
      type === 'Approved'
        ? 'Approved. Have a great time off!'
        : 'Unfortunately, your request cannot be approved due to critical deliverable schedules.'
    );
    setShowModal(true);
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/leaves/${selectedLeave._id}/status`, {
        status: decisionType,
        adminComment,
      });

      if (res.data.success) {
        toast.success(res.data.message || `Leave ${decisionType.toLowerCase()} successfully`);
        setShowModal(false);
        fetchLeaves();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave status');
    } finally {
      setActionLoading(false);
    }
  };

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

  const activeFilters = [];
  if (department !== 'All') {
    activeFilters.push({
      key: 'dept',
      label: 'Dept',
      displayValue: department,
      onRemove: () => setDepartment('All'),
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Time Off & Leave Approval Center
            </h1>
            <Badge variant="brand" size="sm">
              {stats.pending || 0} Awaiting Action
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Centralized authorization queue for employee vacation, sick leaves, and personal time-off.
          </p>
        </div>

        {/* Status Tab Selector */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 text-xs font-medium">
          {['Pending', 'Approved', 'Rejected', 'All'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === s
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-subtle font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s}
              {s === 'Pending' && stats.pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Pending Queue"
          value={stats.pending || 0}
          subtitle="Requests awaiting review"
          icon={Clock}
          iconClassName="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60"
          badge={stats.pending > 0 ? 'Action Needed' : 'Caught Up'}
          badgeVariant={stats.pending > 0 ? 'warning' : 'neutral'}
        />
        <StatCard
          title="Approved Leaves"
          value={stats.approved || 0}
          subtitle="Authorized applications"
          icon={CheckCircle2}
          iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
        />
        <StatCard
          title="Rejected Requests"
          value={stats.rejected || 0}
          subtitle="Declined due to schedule"
          icon={XCircle}
          iconClassName="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60"
        />
        <StatCard
          title="Total Processed"
          value={stats.total || 0}
          subtitle="Overall request volume"
          icon={CalendarDays}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter requests by employee name, reason, or leave type..."
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
        ]}
        activeFilters={activeFilters}
        onClearAll={() => {
          setDepartment('All');
          setSearch('');
        }}
        density={density}
        onDensityChange={setDensity}
      />

      {/* Leave Requests Table */}
      {loading ? (
        <SkeletonTable rows={5} cols={7} />
      ) : leaves.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={`No ${statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} leave requests found`}
          description="There are currently no leave requests matching this filter."
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reason & Remarks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Decision</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {leaves.map((l) => (
              <TableRow key={l._id}>
                {/* Employee info */}
                <TableCell density={density}>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={l.userId?.avatar || demoAvatars.generic(l.userId?.name)}
                      alt={l.userId?.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {l.userId?.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {l.userId?.employeeId} • {l.userId?.department}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Leave Type */}
                <TableCell density={density}>
                  <Badge variant={l.leaveType === 'Paid' ? 'success' : l.leaveType === 'Sick' ? 'brand' : 'neutral'} size="xs">
                    {l.leaveType} Leave
                  </Badge>
                </TableCell>

                {/* Dates */}
                <TableCell density={density}>
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-200 tabular-nums">
                    {l.startDate} <span className="text-slate-400">to</span> {l.endDate}
                  </div>
                </TableCell>

                {/* Duration */}
                <TableCell density={density}>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {l.daysCount} day{l.daysCount > 1 ? 's' : ''}
                  </span>
                </TableCell>

                {/* Reason & Remarks */}
                <TableCell density={density}>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 truncate max-w-xs font-medium">
                    "{l.reason}"
                  </p>
                  {l.adminComment && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5 truncate max-w-xs">
                      Note: {l.adminComment}
                    </p>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell density={density}>
                  {getStatusBadge(l.status)}
                </TableCell>

                {/* Decision Actions */}
                <TableCell density={density} className="text-right">
                  {l.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="success"
                        size="xs"
                        icon={Check}
                        onClick={() => openDecisionModal(l, 'Approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="dangerOutline"
                        size="xs"
                        icon={X}
                        onClick={() => openDecisionModal(l, 'Rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Decision Recorded
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* DECISION MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={decisionType === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
        subtitle={`Confirm ${decisionType.toLowerCase()} decision for ${selectedLeave?.userId?.name}`}
        icon={decisionType === 'Approved' ? CheckCircle2 : AlertTriangle}
        size="md"
      >
        {selectedLeave && (
          <form onSubmit={handleDecisionSubmit} className="space-y-4">
            {/* Request Summary Card */}
            <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700 dark:text-slate-300">
                  {selectedLeave.userId?.name} ({selectedLeave.userId?.department})
                </span>
                <Badge variant={selectedLeave.leaveType === 'Paid' ? 'success' : 'brand'} size="xs">
                  {selectedLeave.leaveType}
                </Badge>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Duration: <strong>{selectedLeave.startDate}</strong> to <strong>{selectedLeave.endDate}</strong> ({selectedLeave.daysCount} days)
              </div>
              <p className="text-slate-500 italic mt-1">
                "{selectedLeave.reason}"
              </p>
            </div>

            <Input
              label="Manager / HR Decision Comment"
              placeholder={decisionType === 'Approved' ? 'Optional remarks for employee' : 'State reason for rejection...'}
              required={decisionType === 'Rejected'}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant={decisionType === 'Approved' ? 'success' : 'danger'}
                size="sm"
                type="submit"
                loading={actionLoading}
                icon={decisionType === 'Approved' ? Check : X}
              >
                Confirm {decisionType}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LeaveApprovalPage;
