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
  Sparkles,
} from 'lucide-react';
import CheckInOutWidget from '../../components/attendance/CheckInOutWidget';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

const MyAttendancePage = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');

  const toast = useToast();

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [weeklyRes, historyRes] = await Promise.all([
        api.get('/attendance/my-weekly'),
        api.get('/attendance/my-history?limit=30'),
      ]);

      if (weeklyRes.data.success) {
        setWeeklyData(weeklyRes.data.weeklyDays || []);
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Present
          </span>
        );
      case 'Half-day':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <Clock className="w-3 h-3 text-amber-400" /> Half-day
          </span>
        );
      case 'Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
            <CalendarDays className="w-3 h-3 text-violet-400" /> Leave
          </span>
        );
      case 'Weekend':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400">
            Weekend
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const filteredHistory = historyData.filter((r) => {
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    const matchesSearch =
      !search ||
      r.date.includes(search) ||
      (r.remarks && r.remarks.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Interactive Punch Widget */}
      <CheckInOutWidget onAttendanceChange={fetchAttendanceData} />

      {/* Weekly View (Mon - Sun) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            Current Week Schedule & Attendance
          </h3>
          <span className="text-xs text-slate-400">Monday – Sunday</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weeklyData.map((day) => (
            <div
              key={day.date}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] ${
                day.isToday
                  ? 'bg-slate-900 border-brand-500/50 shadow-glow'
                  : day.status === 'Weekend'
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-400">{day.shortDay}</span>
                  {day.isToday && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-brand-500 text-white">
                      Today
                    </span>
                  )}
                </div>
                <div className="text-lg font-black text-white">{day.dayNumber}</div>
              </div>

              <div className="space-y-2 mt-3">
                <div>{getStatusBadge(day.status)}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {day.totalHours > 0 ? `${day.totalHours} hrs` : day.checkIn ? 'In Progress' : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Metrics Summary */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Present Days</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {stats.presentCount}{' '}
                <span className="text-xs font-normal text-slate-400">days</span>
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Half-Days</span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {stats.halfDayCount}{' '}
                <span className="text-xs font-normal text-slate-400">days</span>
              </div>
            </div>
            <Clock className="w-6 h-6 text-amber-400" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Hours</span>
              <div className="text-2xl font-black text-brand-400 mt-1">
                {stats.totalHoursWorked} <span className="text-xs font-normal text-slate-400">hrs</span>
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-brand-400" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Daily Average</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {stats.avgDailyHours} <span className="text-xs font-normal text-slate-400">hrs/day</span>
              </div>
            </div>
            <Clock className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      )}

      {/* Full Attendance History Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Attendance History Log
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute inset-y-0 left-3 my-auto" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search date or remarks..."
                className="pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Half-day">Half-day</option>
                <option value="Leave">Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-card">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading attendance history...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No attendance logs found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Check-In</th>
                    <th className="px-6 py-3.5">Check-Out</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Work Mode</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-3.5 text-white font-mono font-bold">{item.date}</td>
                      <td className="px-6 py-3.5 text-slate-300 font-mono">
                        {item.checkIn ? format(new Date(item.checkIn), 'hh:mm a') : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-300 font-mono">
                        {item.checkOut ? format(new Date(item.checkOut), 'hh:mm a') : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-emerald-400 font-bold">
                        {item.totalHours ? `${item.totalHours} hrs` : item.checkIn ? 'In Progress' : '—'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          {item.workMode === 'Remote' ? (
                            <Laptop className="w-3 h-3 text-indigo-400" />
                          ) : (
                            <Building className="w-3 h-3 text-brand-400" />
                          )}
                          {item.workMode}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-3.5 text-slate-400 max-w-xs truncate">
                        {item.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAttendancePage;
