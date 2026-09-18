import React, { useState, useEffect, useRef } from 'react';
import {
  DollarSign,
  Calendar,
  CreditCard,
  Plus,
  Edit2,
  Eye,
  Search,
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Save,
  Check,
  Building,
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
import { DayflowLogo } from '../../components/common/DayflowLogo';

export const PayrollManagementPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(8); // August
  const [selectedYear, setSelectedYear] = useState(2026);
  const [department, setDepartment] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState('comfortable');

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

  const isFirstMount = useRef(true);

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth, selectedYear, department, paymentStatusFilter]);

  // Debounced search
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      fetchPayrollData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    if (!newSalary.userId) {
      toast.error('Please select an employee');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/salaries', {
        ...newSalary,
        month: selectedMonth,
        year: selectedYear,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Payslip generated successfully');
        setShowGenerateModal(false);
        fetchPayrollData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating payslip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/salaries/${selectedRecord._id}`, selectedRecord);
      if (res.data.success) {
        toast.success('Salary record updated');
        setShowEditModal(false);
        fetchPayrollData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating salary record');
    } finally {
      setActionLoading(false);
    }
  };

  const getMonthName = (m) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[m - 1] || `Month ${m}`;
  };

  const exportCSV = () => {
    const headers = ['Month/Year', 'Employee ID', 'Name', 'Department', 'Basic', 'HRA', 'Allowances', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'];
    const rows = records.map((r) => [
      `"${getMonthName(r.month)} ${r.year}"`,
      r.userId?.employeeId || '',
      `"${r.userId?.name || ''}"`,
      `"${r.userId?.department || ''}"`,
      r.basicSalary,
      r.hra,
      r.allowances,
      r.grossSalary,
      (r.deductions?.tax || 0) + (r.deductions?.pf || 0) + (r.deductions?.unpaidLeaveDeduction || 0) + (r.deductions?.other || 0),
      r.netSalary,
      r.paymentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dayflow-payroll-${getMonthName(selectedMonth)}-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payroll summary exported to CSV');
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
  if (paymentStatusFilter !== 'All') {
    activeFilters.push({
      key: 'status',
      label: 'Status',
      displayValue: paymentStatusFilter,
      onRemove: () => setPaymentStatusFilter('All'),
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payroll & Compensation Management
            </h1>
            <Badge variant="brand" size="sm">
              {getMonthName(selectedMonth)} {selectedYear}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Disbursement cycles, statutory tax & PF deductions, allowances, and compliant payslip generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month & Year Selectors */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={exportCSV}
          >
            Export
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowGenerateModal(true)}
          >
            Generate Payslip
          </Button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Disbursed (Net)"
          value={`₹${(stats.totalDisbursed || 0).toLocaleString('en-IN')}`}
          subtitle="Net funds transferred"
          icon={CreditCard}
          iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
        />
        <StatCard
          title="Gross Payroll Volume"
          value={`₹${(stats.totalGross || 0).toLocaleString('en-IN')}`}
          subtitle="Pre-tax compensation"
          icon={DollarSign}
          iconClassName="bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 border-brand-200/60 dark:border-brand-800/60"
        />
        <StatCard
          title="Taxes & PF Withheld"
          value={`₹${(stats.totalDeductions || 0).toLocaleString('en-IN')}`}
          subtitle="Statutory contributions"
          icon={TrendingUp}
        />
        <StatCard
          title="Employees Processed"
          value={`${records.length} / ${employeesList.length || records.length}`}
          subtitle="Processed this period"
          icon={CheckCircle2}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search payslips by employee name or ID..."
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
            label: 'Payment Status',
            value: paymentStatusFilter,
            onChange: setPaymentStatusFilter,
            options: [
              { label: 'All Statuses', value: 'All' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Pending', value: 'Pending' },
            ],
          },
        ]}
        activeFilters={activeFilters}
        onClearAll={() => {
          setDepartment('All');
          setPaymentStatusFilter('All');
          setSearch('');
        }}
        density={density}
        onDensityChange={setDensity}
      />

      {/* Payroll Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No payroll records found"
          description={`No payslips generated for ${getMonthName(selectedMonth)} ${selectedYear} matching your criteria.`}
          action={
            <Button
              variant="primary"
              size="xs"
              icon={Plus}
              onClick={() => setShowGenerateModal(true)}
            >
              Generate First Payslip
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Employee</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>HRA & Allowances</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {records.map((r) => {
              const totalDeductions =
                (r.deductions?.tax || 0) +
                (r.deductions?.pf || 0) +
                (r.deductions?.unpaidLeaveDeduction || 0) +
                (r.deductions?.other || 0);

              return (
                <TableRow key={r._id}>
                  {/* Employee info */}
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

                  {/* Basic */}
                  <TableCell density={density}>
                    <span className="font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200">
                      ₹{r.basicSalary.toLocaleString('en-IN')}
                    </span>
                  </TableCell>

                  {/* HRA & Allowances */}
                  <TableCell density={density}>
                    <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                      ₹{(r.hra + r.allowances).toLocaleString('en-IN')}
                    </span>
                  </TableCell>

                  {/* Gross */}
                  <TableCell density={density}>
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                      ₹{r.grossSalary.toLocaleString('en-IN')}
                    </span>
                  </TableCell>

                  {/* Deductions */}
                  <TableCell density={density}>
                    <span className="font-mono text-xs text-rose-600 dark:text-rose-400 tabular-nums">
                      -₹{totalDeductions.toLocaleString('en-IN')}
                    </span>
                  </TableCell>

                  {/* Net Salary */}
                  <TableCell density={density}>
                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ₹{r.netSalary.toLocaleString('en-IN')}
                    </span>
                  </TableCell>

                  {/* Payment Status */}
                  <TableCell density={density}>
                    <Badge variant={r.paymentStatus === 'Paid' ? 'success' : 'warning'} dot size="xs">
                      {r.paymentStatus}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell density={density} className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="xs"
                        icon={Eye}
                        onClick={() => {
                          setSelectedRecord(r);
                          setShowViewModal(true);
                        }}
                        title="View Official Payslip"
                      >
                        Payslip
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRecord(JSON.parse(JSON.stringify(r)));
                          setShowEditModal(true);
                        }}
                        title="Edit Salary Breakdown"
                        className="p-1 rounded-md text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* GENERATE PAYSLIP MODAL */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Monthly Payslip"
        subtitle={`Create salary disbursement breakdown for ${getMonthName(selectedMonth)} ${selectedYear}`}
        icon={DollarSign}
        size="lg"
      >
        <form onSubmit={handleGeneratePayslip} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Employee <span className="text-rose-500">*</span>
            </label>
            <select
              value={newSalary.userId}
              onChange={(e) => setNewSalary({ ...newSalary, userId: e.target.value })}
              className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {employeesList.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.employeeId} - {emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Basic Salary (₹)"
              type="number"
              required
              value={newSalary.basicSalary}
              onChange={(e) =>
                setNewSalary({ ...newSalary, basicSalary: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="HRA (₹)"
              type="number"
              value={newSalary.hra}
              onChange={(e) =>
                setNewSalary({ ...newSalary, hra: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="Special Allowances (₹)"
              type="number"
              value={newSalary.allowances}
              onChange={(e) =>
                setNewSalary({ ...newSalary, allowances: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Input
              label="Tax / TDS Deduction (₹)"
              type="number"
              value={newSalary.deductions.tax}
              onChange={(e) =>
                setNewSalary({
                  ...newSalary,
                  deductions: { ...newSalary.deductions, tax: parseFloat(e.target.value) || 0 },
                })
              }
            />
            <Input
              label="Provident Fund (PF) (₹)"
              type="number"
              value={newSalary.deductions.pf}
              onChange={(e) =>
                setNewSalary({
                  ...newSalary,
                  deductions: { ...newSalary.deductions, pf: parseFloat(e.target.value) || 0 },
                })
              }
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Payment Status
              </label>
              <select
                value={newSalary.paymentStatus}
                onChange={(e) => setNewSalary({ ...newSalary, paymentStatus: e.target.value })}
                className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Real-time Net Calculation Pill */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500">Calculated Net Payable:</span>
              <div className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
                ₹{Math.max(
                  0,
                  newSalary.basicSalary +
                    newSalary.hra +
                    newSalary.allowances -
                    (newSalary.deductions.tax + newSalary.deductions.pf)
                ).toLocaleString('en-IN')}
              </div>
            </div>
            <Badge variant="brand" size="xs">
              Auto Gross/Net
            </Badge>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              loading={actionLoading}
              icon={Plus}
            >
              Generate Payslip
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT SALARY RECORD MODAL */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Salary Record"
        subtitle={`Modify compensation breakdown for ${selectedRecord?.userId?.name}`}
        icon={Edit2}
        size="lg"
      >
        {selectedRecord && (
          <form onSubmit={handleUpdateRecord} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Input
                label="Basic Salary (₹)"
                type="number"
                value={selectedRecord.basicSalary}
                onChange={(e) =>
                  setSelectedRecord({
                    ...selectedRecord,
                    basicSalary: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="HRA (₹)"
                type="number"
                value={selectedRecord.hra}
                onChange={(e) =>
                  setSelectedRecord({
                    ...selectedRecord,
                    hra: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <Input
                label="Allowances (₹)"
                type="number"
                value={selectedRecord.allowances}
                onChange={(e) =>
                  setSelectedRecord({
                    ...selectedRecord,
                    allowances: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Input
                label="Tax (TDS) (₹)"
                type="number"
                value={selectedRecord.deductions?.tax || 0}
                onChange={(e) =>
                  setSelectedRecord({
                    ...selectedRecord,
                    deductions: {
                      ...(selectedRecord.deductions || {}),
                      tax: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
              <Input
                label="Provident Fund (PF) (₹)"
                type="number"
                value={selectedRecord.deductions?.pf || 0}
                onChange={(e) =>
                  setSelectedRecord({
                    ...selectedRecord,
                    deductions: {
                      ...(selectedRecord.deductions || {}),
                      pf: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Payment Status
                </label>
                <select
                  value={selectedRecord.paymentStatus}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, paymentStatus: e.target.value })
                  }
                  className="w-full py-2 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <Input
              label="Remarks"
              value={selectedRecord.remarks || ''}
              onChange={(e) =>
                setSelectedRecord({ ...selectedRecord, remarks: e.target.value })
              }
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={actionLoading}
                icon={Save}
              >
                Update Record
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* OFFICIAL PAYSLIP VIEW MODAL */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Official Salary Statement"
        subtitle={`Period: ${getMonthName(selectedRecord?.month)} ${selectedRecord?.year}`}
        icon={FileText}
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs">
            {/* Payslip Header */}
            <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <DayflowLogo iconSize={24} />
                <p className="text-[11px] text-slate-400 mt-1">Acme Corporation India Pvt Ltd • HRMS Division</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                  REF: SLIP-{selectedRecord.year}{String(selectedRecord.month).padStart(2, '0')}-{selectedRecord.userId?.employeeId}
                </span>
                <Badge variant={selectedRecord.paymentStatus === 'Paid' ? 'success' : 'warning'} dot size="xs" className="mt-1">
                  Disbursement: {selectedRecord.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Employee Identification */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Employee Name</span>
                <strong className="text-slate-900 dark:text-white font-semibold">{selectedRecord.userId?.name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Employee ID</span>
                <strong className="text-slate-900 dark:text-white font-mono">{selectedRecord.userId?.employeeId}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Department</span>
                <strong className="text-slate-900 dark:text-white">{selectedRecord.userId?.department}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Designation</span>
                <strong className="text-slate-900 dark:text-white">{selectedRecord.userId?.designation}</strong>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 font-semibold border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white">
                  Earnings (Allowances)
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Basic Salary</span>
                    <span className="font-mono tabular-nums font-medium">₹{selectedRecord.basicSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">House Rent Allowance (HRA)</span>
                    <span className="font-mono tabular-nums font-medium">₹{selectedRecord.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Special Allowances</span>
                    <span className="font-mono tabular-nums font-medium">₹{selectedRecord.allowances.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold">
                    <span>Gross Earnings</span>
                    <span className="font-mono tabular-nums text-brand-600 dark:text-brand-400">
                      ₹{selectedRecord.grossSalary.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 font-semibold border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white">
                  Statutory Deductions
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Income Tax (TDS)</span>
                    <span className="font-mono tabular-nums font-medium text-rose-600 dark:text-rose-400">
                      ₹{(selectedRecord.deductions?.tax || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Provident Fund (PF)</span>
                    <span className="font-mono tabular-nums font-medium text-rose-600 dark:text-rose-400">
                      ₹{(selectedRecord.deductions?.pf || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Unpaid Leave Deductions</span>
                    <span className="font-mono tabular-nums font-medium text-rose-600 dark:text-rose-400">
                      ₹{(selectedRecord.deductions?.unpaidLeaveDeduction || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold">
                    <span>Total Deductions</span>
                    <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                      ₹{(
                        (selectedRecord.deductions?.tax || 0) +
                        (selectedRecord.deductions?.pf || 0) +
                        (selectedRecord.deductions?.unpaidLeaveDeduction || 0)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Total Net Payable
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300 tabular-nums">
                  ₹{selectedRecord.netSalary.toLocaleString('en-IN')}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => {
                  window.print();
                }}
              >
                Print Statement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PayrollManagementPage;
