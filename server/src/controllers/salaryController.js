const Salary = require('../models/Salary');
const User = require('../models/User');

// Helper to compute gross and net salary
const computeSalaryTotals = (data) => {
  const basic = Number(data.basicSalary) || 0;
  const hra = Number(data.hra) || 0;
  const allowances = Number(data.allowances) || 0;
  const grossSalary = basic + hra + allowances;

  const deductions = data.deductions || {};
  const tax = Number(deductions.tax) || 0;
  const pf = Number(deductions.pf) || 0;
  const unpaidLeaveDeduction = Number(deductions.unpaidLeaveDeduction) || 0;
  const other = Number(deductions.other) || 0;
  const totalDeductions = tax + pf + unpaidLeaveDeduction + other;

  const netSalary = Math.max(0, grossSalary - totalDeductions);

  return {
    grossSalary,
    netSalary,
    deductions: { tax, pf, unpaidLeaveDeduction, other },
  };
};

// @desc    Get employee personal salary records & payslips
// @route   GET /api/salaries/my-payslips
// @access  Private (Employee / Admin for self)
const getMyPayslips = async (req, res) => {
  try {
    const userId = req.user._id;

    const payslips = await Salary.find({ userId })
      .populate('userId', 'name employeeId email department designation avatar joiningDate')
      .sort({ year: -1, month: -1 });

    const latest = payslips.length > 0 ? payslips[0] : null;

    res.status(200).json({
      success: true,
      count: payslips.length,
      latest,
      payslips,
    });
  } catch (error) {
    console.error('Get My Payslips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payslips',
      error: error.message,
    });
  }
};

// @desc    Get company-wide payroll records (Admin only)
// @route   GET /api/salaries/all
// @access  Private (Admin only)
const getAllPayroll = async (req, res) => {
  try {
    const { month, year, department, search, paymentStatus } = req.query;

    const query = {};
    if (month) query.month = parseInt(month, 10);
    if (year) query.year = parseInt(year, 10);
    if (paymentStatus && paymentStatus !== 'All') query.paymentStatus = paymentStatus;

    let records = await Salary.find(query)
      .populate('userId', 'name email employeeId department designation avatar status')
      .sort({ year: -1, month: -1 });

    // In-memory filter for populated fields
    if (department && department !== 'All') {
      records = records.filter(
        (r) => r.userId && r.userId.department === department
      );
    }

    if (search) {
      const s = search.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.userId &&
          (r.userId.name.toLowerCase().includes(s) ||
            r.userId.email.toLowerCase().includes(s) ||
            r.userId.employeeId.toLowerCase().includes(s) ||
            r.userId.designation.toLowerCase().includes(s))
      );
    }

    // Calculate payroll totals
    const totalDisbursed = records
      .filter((r) => r.paymentStatus === 'Paid')
      .reduce((sum, r) => sum + (r.netSalary || 0), 0);

    const totalGross = records.reduce((sum, r) => sum + (r.grossSalary || 0), 0);
    const totalNet = records.reduce((sum, r) => sum + (r.netSalary || 0), 0);
    const totalDeductions = totalGross - totalNet;

    res.status(200).json({
      success: true,
      count: records.length,
      stats: {
        totalGross,
        totalNet,
        totalDisbursed,
        totalDeductions,
        paidCount: records.filter((r) => r.paymentStatus === 'Paid').length,
        pendingCount: records.filter((r) => r.paymentStatus === 'Pending').length,
      },
      records,
    });
  } catch (error) {
    console.error('Get All Payroll Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payroll records',
      error: error.message,
    });
  }
};

// @desc    Generate / create a monthly salary payslip (Admin only)
// @route   POST /api/salaries
// @access  Private (Admin only)
const createSalaryRecord = async (req, res) => {
  try {
    const {
      userId,
      month,
      year,
      basicSalary,
      hra = 0,
      allowances = 0,
      deductions = {},
      paymentStatus = 'Paid',
      paymentDate,
      remarks = 'Monthly salary disbursement',
    } = req.body;

    if (!userId || !month || !year || basicSalary === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, month, year, and basic salary',
      });
    }

    const employee = await User.findById(userId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Check if salary already exists for this employee for this month+year
    let existingSalary = await Salary.findOne({ userId, month, year });
    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: `Salary record for ${employee.name} for month ${month}/${year} already exists. Please update the existing record instead.`,
      });
    }

    const { grossSalary, netSalary, deductions: calculatedDeductions } = computeSalaryTotals({
      basicSalary,
      hra,
      allowances,
      deductions,
    });

    const newSalary = new Salary({
      userId,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      basicSalary: Number(basicSalary),
      hra: Number(hra),
      allowances: Number(allowances),
      deductions: calculatedDeductions,
      grossSalary,
      netSalary,
      paymentStatus,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      remarks,
    });

    await newSalary.save();
    await newSalary.populate('userId', 'name email employeeId department designation avatar');

    res.status(201).json({
      success: true,
      message: `Payslip for ${employee.name} (${month}/${year}) generated successfully`,
      salary: newSalary,
    });
  } catch (error) {
    console.error('Create Salary Record Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create salary record',
      error: error.message,
    });
  }
};

// @desc    Update salary components & structure (Admin only)
// @route   PUT /api/salaries/:id
// @access  Private (Admin only)
const updateSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      basicSalary,
      hra,
      allowances,
      deductions,
      paymentStatus,
      paymentDate,
      remarks,
    } = req.body;

    const salary = await Salary.findById(id).populate(
      'userId',
      'name employeeId department designation'
    );
    if (!salary) {
      return res.status(404).json({ success: false, message: 'Salary record not found' });
    }

    if (basicSalary !== undefined) salary.basicSalary = Number(basicSalary);
    if (hra !== undefined) salary.hra = Number(hra);
    if (allowances !== undefined) salary.allowances = Number(allowances);
    if (paymentStatus) salary.paymentStatus = paymentStatus;
    if (paymentDate) salary.paymentDate = new Date(paymentDate);
    if (remarks) salary.remarks = remarks;

    if (deductions) {
      salary.deductions = {
        tax: deductions.tax !== undefined ? Number(deductions.tax) : salary.deductions.tax,
        pf: deductions.pf !== undefined ? Number(deductions.pf) : salary.deductions.pf,
        unpaidLeaveDeduction:
          deductions.unpaidLeaveDeduction !== undefined
            ? Number(deductions.unpaidLeaveDeduction)
            : salary.deductions.unpaidLeaveDeduction,
        other:
          deductions.other !== undefined ? Number(deductions.other) : salary.deductions.other,
      };
    }

    // Recalculate totals
    const totalAllowances =
      (salary.basicSalary || 0) + (salary.hra || 0) + (salary.allowances || 0);
    const totalDeductions =
      (salary.deductions?.tax || 0) +
      (salary.deductions?.pf || 0) +
      (salary.deductions?.unpaidLeaveDeduction || 0) +
      (salary.deductions?.other || 0);

    salary.grossSalary = totalAllowances;
    salary.netSalary = Math.max(0, totalAllowances - totalDeductions);

    await salary.save();

    res.status(200).json({
      success: true,
      message: `Salary for ${salary.userId?.name || 'Employee'} updated successfully. Net Salary: ₹${salary.netSalary}`,
      salary,
    });
  } catch (error) {
    console.error('Update Salary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salary record',
      error: error.message,
    });
  }
};

module.exports = {
  getMyPayslips,
  getAllPayroll,
  createSalaryRecord,
  updateSalaryRecord,
};
