import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  Building,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Laptop,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState({
    loading: true,
    stats: { totalPresent: 0, totalHalfDay: 0, totalLeave: 0 },
    records: [],
  });
  const [totalEmployees, setTotalEmployees] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const [attRes, usersRes] = await Promise.all([
        api.get('/attendance/all'),
        api.get('/users'),
      ]);

      if (attRes.data.success) {
        setAttendanceData({
          loading: false,
          stats: attRes.data.stats || { totalPresent: 0, totalHalfDay: 0, totalLeave: 0 },
          records: attRes.data.records || [],
        });
      }

      if (usersRes.data.success) {
        setTotalEmployees(usersRes.data.total || usersRes.data.employees?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setAttendanceData((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const presentPercentage =
    totalEmployees > 0
      ? Math.round((attendanceData.stats.totalPresent / totalEmployees) * 100)
      : 100;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-950/70 via-slate-900 to-indigo-950/50 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated HR Administrator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Workforce Operations & Real-Time HR Control Center.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
              <span className="text-2xl font-black text-white">{totalEmployees}</span>
              <p className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">
                Workforce
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
              <span className="text-2xl font-black text-emerald-400">
                {attendanceData.stats.totalPresent}
              </span>
              <p className="text-[11px] text-slate-400 uppercase font-semibold mt-0.5">
                Present Today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Today Roll Call</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {attendanceData.stats.totalPresent} / {totalEmployees}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {presentPercentage}% attendance rate
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Half-Day Working</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {attendanceData.stats.totalHalfDay}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Under 7.5 hours</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">On Approved Leave</span>
            <div className="text-2xl font-black text-violet-400 mt-1">
              {attendanceData.stats.totalLeave}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Scheduled time-off</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Departments</span>
            <div className="text-2xl font-black text-brand-400 mt-1">4</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Cross-functional</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Today Attendance Activity Feed & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Attendance Feed */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              Today's Live Punch Feed ({format(new Date(), 'yyyy-MM-dd')})
            </h3>
            <Link
              to="/admin/attendance"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {attendanceData.loading ? (
            <div className="p-8 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              Loading live punches...
            </div>
          ) : attendanceData.records.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No punch events recorded yet today.
            </div>
          ) : (
            <div className="space-y-2.5">
              {attendanceData.records.slice(0, 4).map((r) => (
                <div
                  key={r._id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        r.userId?.avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
                      }
                      alt={r.userId?.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{r.userId?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.userId?.department} • {r.workMode}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {r.checkIn ? format(new Date(r.checkIn), 'hh:mm a') : '—'}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {r.totalHours ? `${r.totalHours} hrs` : 'Working...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: HR Management Shortcuts */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-card">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
            Quick Actions
          </h3>

          <div className="space-y-3">
            <Link
              to="/admin/employees"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-brand-300">
                    Employee Directory
                  </div>
                  <div className="text-[10px] text-slate-400">Onboard & manage staff</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/attendance"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                    Attendance Roll Call
                  </div>
                  <div className="text-[10px] text-slate-400">Daily verification & logs</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/leaves"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-violet-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-violet-300">
                    Time Off Approvals
                  </div>
                  <div className="text-[10px] text-slate-400">Approve / reject leave requests</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/admin/payroll"
              className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                    Company Payroll
                  </div>
                  <div className="text-[10px] text-slate-400">Monthly payslips & taxes</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
