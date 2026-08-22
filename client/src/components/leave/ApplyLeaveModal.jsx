import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CalendarDays,
  HeartHandshake,
  AlertCircle,
  X,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { format, differenceInCalendarDays, parseISO, isAfter } from 'date-fns';

const ApplyLeaveModal = ({ isOpen, onClose, onSuccess, userBalance }) => {
  const [leaveType, setLeaveType] = useState('Paid');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reason, setReason] = useState('');
  const [daysCount, setDaysCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toast = useToast();

  // Recalculate days count whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setErrorMsg('Invalid dates');
        setDaysCount(0);
        return;
      }

      if (isAfter(start, end)) {
        setErrorMsg('Start date cannot be after end date');
        setDaysCount(0);
        return;
      }

      const diff = differenceInCalendarDays(end, start) + 1;
      setDaysCount(diff);
      setErrorMsg('');

      // Check balance warning
      if (leaveType === 'Paid' && userBalance?.paid !== undefined && diff > userBalance.paid) {
        setErrorMsg(
          `Requested days (${diff}) exceed available Paid balance (${userBalance.paid} days)`
        );
      } else if (
        leaveType === 'Sick' &&
        userBalance?.sick !== undefined &&
        diff > userBalance.sick
      ) {
        setErrorMsg(
          `Requested days (${diff}) exceed available Sick balance (${userBalance.sick} days)`
        );
      }
    }
  }, [startDate, endDate, leaveType, userBalance]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please specify a reason for your leave');
      return;
    }
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableBalance = () => {
    if (leaveType === 'Paid') return userBalance?.paid ?? 12;
    if (leaveType === 'Sick') return userBalance?.sick ?? 8;
    return 'Unlimited (Unpaid)';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Apply for Time Off</h3>
              <p className="text-xs text-slate-400">Submit a leave request for HR approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leave Type Selector Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Leave Category
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setLeaveType('Paid')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                leaveType === 'Paid'
                  ? 'bg-emerald-950/50 border-emerald-500/50 text-white shadow-glow'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-emerald-400">Paid Leave</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {userBalance?.paid ?? 12} days left
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLeaveType('Sick')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                leaveType === 'Sick'
                  ? 'bg-brand-950/50 border-brand-500/50 text-white shadow-glow'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-brand-400">Sick Leave</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {userBalance?.sick ?? 8} days left
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLeaveType('Unpaid')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                leaveType === 'Unpaid'
                  ? 'bg-indigo-950/50 border-indigo-500/50 text-white shadow-glow'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-indigo-400">Unpaid</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Salary adjusted</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Dynamic Days Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Calculated Duration:</span>
            <span className="font-bold text-emerald-400 text-sm">
              {daysCount} {daysCount === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Reason / Remarks *</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Attending hackathon finals, family function, viral fever..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Error / Balance Warning Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !!errorMsg || daysCount <= 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-glow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
