import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  TrendingDown,
  TrendingUp,
  Building,
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { format } from 'date-fns';

import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import { DayflowLogo } from '../../components/common/DayflowLogo';

export const MySalaryPage = () => {
  const [payslips, setPayslips] = useState([]);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const res = await api.get('/salaries/my-payslips');
      if (res.data.success) {
        setPayslips(res.data.payslips || []);
        if (res.data.payslips?.length > 0) {
          setSelectedPayslip(res.data.payslips[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load salary payslips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const getMonthName = (m) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[m - 1] || `Month ${m}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Salary & Payslips
            </h1>
            <Badge variant="success" dot size="sm">
              Disbursed Monthly
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent breakdown of gross earnings, statutory tax/PF deductions, and printable payslip statements.
          </p>
        </div>

        {selectedPayslip && (
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Statement
          </Button>
        )}
      </div>

      {payslips.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payslips generated yet"
          description="Your organization has not yet processed a monthly salary slip for your profile."
        />
      ) : (
        <>
          {/* Selected Payslip Inspection Card */}
          {selectedPayslip && (
            <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle p-5 sm:p-6 space-y-5">
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <DayflowLogo iconSize={26} />
                  <p className="text-[11px] text-slate-400 mt-1">Acme Corporation India Pvt Ltd • Official Compensation Record</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {getMonthName(selectedPayslip.month)} {selectedPayslip.year}
                  </div>
                  <Badge variant="success" dot size="xs" className="mt-0.5">
                    Disbursed: {selectedPayslip.paymentStatus}
                  </Badge>
                </div>
              </div>

              {/* Financial Metrics Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Gross Earnings</span>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-0.5">
                    ₹{selectedPayslip.grossSalary.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 block uppercase font-semibold">Statutory Deductions</span>
                  <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                    -₹{(
                      (selectedPayslip.deductions?.tax || 0) +
                      (selectedPayslip.deductions?.pf || 0) +
                      (selectedPayslip.deductions?.unpaidLeaveDeduction || 0)
                    ).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/30">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-semibold">Net Salary Payable</span>
                  <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300 tabular-nums mt-0.5">
                    ₹{selectedPayslip.netSalary.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Earnings */}
                <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 font-semibold border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white">
                    Earnings Breakdown
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                      <span className="font-mono tabular-nums font-medium">₹{selectedPayslip.basicSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                      <span className="font-mono tabular-nums font-medium">₹{selectedPayslip.hra.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Special Allowances</span>
                      <span className="font-mono tabular-nums font-medium">₹{selectedPayslip.allowances.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold">
                      <span>Total Gross</span>
                      <span className="font-mono tabular-nums text-brand-600 dark:text-brand-400">
                        ₹{selectedPayslip.grossSalary.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 font-semibold border-b border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white">
                    Deductions Breakdown
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Income Tax (TDS)</span>
                      <span className="font-mono tabular-nums font-medium text-rose-600 dark:text-rose-400">
                        ₹{(selectedPayslip.deductions?.tax || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Provident Fund (PF)</span>
                      <span className="font-mono tabular-nums font-medium text-rose-600 dark:text-rose-400">
                        ₹{(selectedPayslip.deductions?.pf || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Unpaid Leave Deductions</span>
                      <span className="font-mono tabular-nums font-medium text-rose-600 dark:text-rose-400">
                        ₹{(selectedPayslip.deductions?.unpaidLeaveDeduction || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold">
                      <span>Total Deductions</span>
                      <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                        ₹{(
                          (selectedPayslip.deductions?.tax || 0) +
                          (selectedPayslip.deductions?.pf || 0) +
                          (selectedPayslip.deductions?.unpaidLeaveDeduction || 0)
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Past Payslips History Table */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Statement History
            </h3>

            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Statement Period</TableHead>
                  <TableHead>Gross Salary</TableHead>
                  <TableHead>Total Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {payslips.map((p) => {
                  const isSelected = selectedPayslip?._id === p._id;
                  const totalDed =
                    (p.deductions?.tax || 0) +
                    (p.deductions?.pf || 0) +
                    (p.deductions?.unpaidLeaveDeduction || 0);

                  return (
                    <TableRow
                      key={p._id}
                      className={isSelected ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''}
                    >
                      <TableCell>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {getMonthName(p.month)} {p.year}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs tabular-nums text-slate-800 dark:text-slate-200">
                          ₹{p.grossSalary.toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs tabular-nums text-rose-600 dark:text-rose-400">
                          -₹{totalDed.toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                          ₹{p.netSalary.toLocaleString('en-IN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" dot size="xs">
                          {p.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={isSelected ? 'primary' : 'outline'}
                          size="xs"
                          onClick={() => setSelectedPayslip(p)}
                        >
                          {isSelected ? 'Viewing' : 'Inspect'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default MySalaryPage;
