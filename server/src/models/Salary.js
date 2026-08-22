const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    hra: {
      type: Number,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      tax: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      unpaidLeaveDeduction: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: 'Monthly salary disbursement',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save calculate gross and net salary
salarySchema.pre('save', function (next) {
  const totalAllowances = (this.basicSalary || 0) + (this.hra || 0) + (this.allowances || 0);
  const totalDeductions =
    (this.deductions?.tax || 0) +
    (this.deductions?.pf || 0) +
    (this.deductions?.unpaidLeaveDeduction || 0) +
    (this.deductions?.other || 0);

  this.grossSalary = totalAllowances;
  this.netSalary = Math.max(0, totalAllowances - totalDeductions);
  next();
});

salarySchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Salary', salarySchema);
