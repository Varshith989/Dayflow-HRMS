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
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import demoAvatars from '../../utils/avatars';
import { format } from 'date-fns';

const AllAttendancePage = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [department, setDepartment] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalPresent: 0, totalHalfDay: 0, totalLeave: 0 });
  const [loading, setLoading] = useState(true);

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
    }, 300);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Present
          </span>
        );
      case 'Half-day':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Half-day
          </span>
        );
      case 'Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25">
            <CalendarDays className="w-3 h-3 text-violet-600 dark:text-violet-400" /> Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Date Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Company Attendance Log
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time workforce roll call, punch verification, and regularization portal.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-card">
          <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Select Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Recorded</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{records.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Present</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.totalPresent}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Half-Day</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.totalHalfDay}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex items-center justify-between transition-colors">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">On Leave</span>
            <div className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">
              {stats.totalLeave}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute inset-y-0 left-3.5 my-auto" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Dept:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product Design">Product Design</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Half-day">Half-day</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-card transition-colors">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Loading company attendance records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            No attendance punches recorded for {selectedDate}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4">Total Hours</th>
                  <th className="px-6 py-4">Work Mode</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.userId?.avatar || demoAvatars.generic(r.userId?.name?.slice(0, 2))}
                          alt={r.userId?.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {r.userId?.name || 'Staff Member'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            {r.userId?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-slate-200 font-semibold">{r.userId?.department}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.userId?.designation}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                      {r.checkIn ? format(new Date(r.checkIn), 'hh:mm:ss a') : '—'}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                      {r.checkOut ? format(new Date(r.checkOut), 'hh:mm:ss a') : '—'}
                    </td>

                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      {r.totalHours ? `${r.totalHours} hrs` : r.checkIn ? 'In Progress' : '—'}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        {r.workMode === 'Remote' ? (
                          <Laptop className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Building className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                        )}
                        {r.workMode}
                      </span>
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(r.status)}</td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRecord(JSON.parse(JSON.stringify(r)));
                          setEditModalOpen(true);
                        }}
                        title="Regularize / Edit Attendance"
                        className="px-2.5 py-1.5 rounded-lg bg-brand-600/15 hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT / REGULARIZE MODAL */}
      {editModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Regularize Attendance</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedRecord.userId?.name} • {selectedRecord.date}
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={selectedRecord.status}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, status: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Present">Present</option>
                  <option value="Half-day">Half-day</option>
                  <option value="Leave">Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Hours Worked</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedRecord.totalHours}
                  onChange={(e) =>
                    setSelectedRecord({
                      ...selectedRecord,
                      totalHours: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Mode</label>
                <select
                  value={selectedRecord.workMode}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, workMode: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Office">Office</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={selectedRecord.remarks || ''}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, remarks: e.target.value })
                  }
                  placeholder="Regularization justification..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-1.5 shadow-glow disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAttendancePage;
