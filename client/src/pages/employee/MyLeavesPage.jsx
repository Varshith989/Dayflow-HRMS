import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  HeartHandshake,
  MessageSquare,
} from 'lucide-react';
import ApplyLeaveModal from '../../components/leave/ApplyLeaveModal';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const MyLeavesPage = () => {
  const { user, updateUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(user?.leaveBalance || { paid: 14, sick: 7, unpaid: 0 });
  const [stats, setStats] = useState({ totalApplications: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Pending Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const matchesStatus = selectedStatus === 'All' || l.status === selectedStatus;
    const matchesSearch =
      !search ||
      l.leaveType.toLowerCase().includes(search.toLowerCase()) ||
      l.reason.toLowerCase().includes(search.toLowerCase()) ||
      l.startDate.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Apply Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Time Off & Leave Portal
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Apply for planned time-off, track HR approvals, and review available leave quotas.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Paid Leave Balance
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {leaveBalance?.paid || 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Full pay compensation</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Sick Leave Balance
            </span>
            <div className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {leaveBalance?.sick || 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">days</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Medical & health quota</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.pending}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">awaiting review</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">HR evaluation queue</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl w-full sm:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === status
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-3.5 my-auto" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reason or date..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Leave History Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-card transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Loading leave history...</span>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            No leave applications found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Date Range</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">HR Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                {filteredLeaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          l.leaveType === 'Paid'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                            : l.leaveType === 'Sick'
                            ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/25'
                            : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25'
                        }`}
                      >
                        {l.leaveType} Leave
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-800 dark:text-slate-200">
                      <div>
                        {l.startDate} <span className="text-slate-400">to</span> {l.endDate}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {l.daysCount} {l.daysCount === 1 ? 'day' : 'days'}
                    </td>

                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-xs">{l.reason}</td>

                    <td className="px-6 py-4">{getStatusBadge(l.status)}</td>

                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs">
                      {l.adminComment ? (
                        <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                          <MessageSquare className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[11px]">{l.adminComment}</span>
                            {l.reviewedBy?.name && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                — {l.reviewedBy.name}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No comments</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchMyLeaves}
        userBalance={leaveBalance}
      />
    </div>
  );
};

export default MyLeavesPage;
