import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Eye,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Sparkles,
  X,
  Check,
  Save,
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

const PayrollManagementPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(8); // August
  const [selectedYear, setSelectedYear] = useState(2026);
  const [department, setDepartment] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalGross: 0, totalNet: 0, totalDisbursed: 0, totalDeductions: 0 });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Generate payslip form
  const [newSalary, setNewSalary] = useState({
    userId: '',
    month: 8,
    year: 2026,
    basicSalary: 60000,
    hra: 20000,
    allowances: 10000,
    deductions: { tax: 6000, pf: 3500, unpaidLeaveDeduction: 0, other: 0 },
    paymentStatus: 'Paid',
    remarks: 'Monthly salary disbursement',
  });

  const toast = useToast();

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const params = {
        month: selectedMonth,
        year: selectedYear,
      };
      if (department !== 'All') params.department = department;
      if (paymentStatusFilter !== 'All') params.paymentStatus = paymentStatusFilter;
      if (search) params.search = search;

      const [payRes, usersRes] = await Promise.all([
        api.get('/salaries/all', { params }),
        api.get('/users'),
      ]);

      if (payRes.data.success) {
        setRecords(payRes.data.records || []);
        if (payRes.data.stats) setStats(payRes.data.stats);
      }

      if (usersRes.data.success) {
        setEmployeesList(usersRes.data.employees || []);
        if (!newSalary.userId && usersRes.data.employees?.length > 0) {
          setNewSalary((prev) => ({ ...prev, userId: usersRes.data.employees[0]._id }));
        }
      }
    } catch (error) {
      toast.error('Failed to load payroll records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth, selectedYear, department, paymentStatusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayrollData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    if (!newSalary.userId || !newSalary.basicSalary) {
      toast.error('Please select an employee and specify basic salary');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/salaries', newSalary);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowGenerateModal(false);
        fetchPayrollData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate payslip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/salaries/${selectedRecord._id}`, selectedRecord);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowEditModal(false);
        fetchPayrollData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update salary');
    } finally {
      setActionLoading(false);
    }
  };

  const months = [
    { num: 1, name: 'January' },
    { num: 2, name: 'February' },
    { num: 3, name: 'March' },
    { num: 4, name: 'April' },
    { num: 5, name: 'May' },
    { num: 6, name: 'June' },
    { num: 7, name: 'July' },
    { num: 8, name: 'August' },
    { num: 9, name: 'September' },
    { num: 10, name: 'October' },
    { num: 11, name: 'November' },
    { num: 12, name: 'December' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Generate Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Payroll & Compensation
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage organization payroll, generate monthly payslips, and adjust statutory components.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-glow flex items-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Monthly Payslip</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Disbursed</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ₹{stats.totalDisbursed?.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Disbursed net salary</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Gross Payroll</span>
            <div className="text-2xl font-black text-white mt-1">
              ₹{stats.totalGross?.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Pre-deductions volume</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Deductions</span>
            <div className="text-2xl font-black text-rose-400 mt-1">
              ₹{stats.totalDeductions?.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">PF, TDS & Adjustments</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Processed Slips</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{records.length}</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Employees in cycle</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar (Month/Year, Dept, Search) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month and Year Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs text-slate-400">Cycle:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product Design">Product Design</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute inset-y-0 left-3.5 my-auto" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Payroll Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Loading company payroll records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No salary records generated for this cycle. Click "Generate Monthly Payslip" to create.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Basic Pay</th>
                  <th className="px-6 py-4">Allowances</th>
                  <th className="px-6 py-4">Deductions</th>
                  <th className="px-6 py-4">Net Salary</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Employee info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            r.userId?.avatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
                          }
                          alt={r.userId?.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">
                            {r.userId?.name || 'Unknown'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {r.userId?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-200 font-semibold">{r.userId?.department}</div>
                      <div className="text-[11px] text-slate-400">{r.userId?.designation}</div>
                    </td>

                    <td className="px-6 py-4 font-mono font-semibold text-slate-300">
                      ₹{r.basicSalary?.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 font-mono text-emerald-400">
                      +₹{((r.hra || 0) + (r.allowances || 0))?.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 font-mono text-rose-400">
                      -₹{(r.grossSalary - r.netSalary)?.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                      ₹{r.netSalary?.toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {r.paymentStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setShowViewModal(true);
                          }}
                          title="View Official Payslip"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecord(JSON.parse(JSON.stringify(r)));
                            setShowEditModal(true);
                          }}
                          title="Edit Salary Structure"
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: GENERATE MONTHLY PAYSLIP */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Generate Monthly Payslip</h3>
                  <p className="text-xs text-slate-400">Create employee salary breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePayslip} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Select Employee *</label>
                <select
                  required
                  value={newSalary.userId}
                  onChange={(e) => setNewSalary({ ...newSalary, userId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {employeesList.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeId}) — {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month and Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pay Month</label>
                  <select
                    value={newSalary.month}
                    onChange={(e) => setNewSalary({ ...newSalary, month: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {months.map((m) => (
                      <option key={m.num} value={m.num}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pay Year</label>
                  <input
                    type="number"
                    value={newSalary.year}
                    onChange={(e) => setNewSalary({ ...newSalary, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Earnings Components */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block">
                  Earnings Components
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Basic Salary (₹)</label>
                    <input
                      type="number"
                      required
                      value={newSalary.basicSalary}
                      onChange={(e) =>
                        setNewSalary({ ...newSalary, basicSalary: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">HRA (₹)</label>
                    <input
                      type="number"
                      value={newSalary.hra}
                      onChange={(e) =>
                        setNewSalary({ ...newSalary, hra: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Allowances (₹)</label>
                    <input
                      type="number"
                      value={newSalary.allowances}
                      onChange={(e) =>
                        setNewSalary({ ...newSalary, allowances: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions Components */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="font-bold text-rose-400 uppercase tracking-wider block">
                  Statutory Deductions
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">PF (₹)</label>
                    <input
                      type="number"
                      value={newSalary.deductions.pf}
                      onChange={(e) =>
                        setNewSalary({
                          ...newSalary,
                          deductions: { ...newSalary.deductions, pf: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tax / TDS (₹)</label>
                    <input
                      type="number"
                      value={newSalary.deductions.tax}
                      onChange={(e) =>
                        setNewSalary({
                          ...newSalary,
                          deductions: { ...newSalary.deductions, tax: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated preview */}
              <div className="p-3.5 rounded-2xl bg-brand-950/40 border border-brand-800/40 flex justify-between items-center text-xs">
                <span className="text-brand-300 font-semibold">Estimated Net Take-Home:</span>
                <span className="text-lg font-black text-white font-mono">
                  ₹
                  {(
                    Number(newSalary.basicSalary || 0) +
                    Number(newSalary.hra || 0) +
                    Number(newSalary.allowances || 0) -
                    (Number(newSalary.deductions?.pf || 0) + Number(newSalary.deductions?.tax || 0))
                  )?.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 shadow-glow disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save & Disburse Payslip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT SALARY STRUCTURE */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Edit Salary • {selectedRecord.userId?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cycle: {selectedRecord.month}/{selectedRecord.year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSalary} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block">
                  Earnings
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Basic Salary (₹)</label>
                    <input
                      type="number"
                      value={selectedRecord.basicSalary}
                      onChange={(e) =>
                        setSelectedRecord({
                          ...selectedRecord,
                          basicSalary: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">HRA (₹)</label>
                    <input
                      type="number"
                      value={selectedRecord.hra}
                      onChange={(e) =>
                        setSelectedRecord({ ...selectedRecord, hra: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Allowances (₹)</label>
                    <input
                      type="number"
                      value={selectedRecord.allowances}
                      onChange={(e) =>
                        setSelectedRecord({
                          ...selectedRecord,
                          allowances: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <span className="font-bold text-rose-400 uppercase tracking-wider block">
                  Deductions
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">PF (₹)</label>
                    <input
                      type="number"
                      value={selectedRecord.deductions?.pf || 0}
                      onChange={(e) =>
                        setSelectedRecord({
                          ...selectedRecord,
                          deductions: {
                            ...selectedRecord.deductions,
                            pf: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tax / TDS (₹)</label>
                    <input
                      type="number"
                      value={selectedRecord.deductions?.tax || 0}
                      onChange={(e) =>
                        setSelectedRecord({
                          ...selectedRecord,
                          deductions: {
                            ...selectedRecord.deductions,
                            tax: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Unpaid Leave Ded (₹)</label>
                    <input
                      type="number"
                      value={selectedRecord.deductions?.unpaidLeaveDeduction || 0}
                      onChange={(e) =>
                        setSelectedRecord({
                          ...selectedRecord,
                          deductions: {
                            ...selectedRecord.deductions,
                            unpaidLeaveDeduction: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Payment Status</label>
                <select
                  value={selectedRecord.paymentStatus}
                  onChange={(e) =>
                    setSelectedRecord({
                      ...selectedRecord,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 shadow-glow disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW FORMAL PAYSLIP */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Employee Payslip Document</h3>
                  <p className="text-xs text-slate-400">
                    {selectedRecord.userId?.name} • Cycle {selectedRecord.month}/{selectedRecord.year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div>
                  <span className="text-slate-500 uppercase">Employee</span>
                  <div className="text-white font-bold">{selectedRecord.userId?.name}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase">Employee ID</span>
                  <div className="text-slate-200 font-mono">{selectedRecord.userId?.employeeId}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase">Department</span>
                  <div className="text-slate-200">{selectedRecord.userId?.department}</div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase">Status</span>
                  <div className="text-emerald-400 font-bold">{selectedRecord.paymentStatus}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                    Earnings
                  </span>
                  <div className="flex justify-between text-slate-300">
                    <span>Basic:</span>
                    <span className="font-mono font-semibold">₹{selectedRecord.basicSalary?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>HRA:</span>
                    <span className="font-mono font-semibold">₹{selectedRecord.hra?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Allowances:</span>
                    <span className="font-mono font-semibold">₹{selectedRecord.allowances?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                    <span>Gross:</span>
                    <span className="font-mono">₹{selectedRecord.grossSalary?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="font-bold text-rose-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                    Deductions
                  </span>
                  <div className="flex justify-between text-slate-300">
                    <span>PF:</span>
                    <span className="font-mono font-semibold">₹{(selectedRecord.deductions?.pf || 0)?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tax:</span>
                    <span className="font-mono font-semibold">₹{(selectedRecord.deductions?.tax || 0)?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Unpaid Leave:</span>
                    <span className="font-mono font-semibold">₹{(selectedRecord.deductions?.unpaidLeaveDeduction || 0)?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                    <span>Total Deductions:</span>
                    <span className="font-mono">₹{(selectedRecord.grossSalary - selectedRecord.netSalary)?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-950/50 border border-brand-500/30 flex justify-between items-center">
                <span className="text-brand-300 font-bold">Net Salary Payable:</span>
                <span className="text-2xl font-black text-white font-mono">
                  ₹{selectedRecord.netSalary?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagementPage;
