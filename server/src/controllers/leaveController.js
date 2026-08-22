const Leave = require('../models/Leave');
const User = require('../models/User');
const { differenceInCalendarDays, parseISO, isAfter, isBefore } = require('date-fns');

// Helper to calculate days count (inclusive)
const calculateDays = (startDateStr, endDateStr) => {
  const start = parseISO(startDateStr);
  const end = parseISO(endDateStr);
  const diff = differenceInCalendarDays(end, start);
  return diff + 1;
};

// @desc    Apply for a new leave
// @route   POST /api/leaves
// @access  Private (Employee / Admin for self)
const applyLeave = async (req, res) => {
  try {
    const userId = req.user._id;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason',
      });
    }

    // Validate dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided. Please use YYYY-MM-DD.',
      });
    }

    if (isAfter(start, end)) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date',
      });
    }

    const daysCount = calculateDays(startDate, endDate);
    if (daysCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Leave duration must be at least 1 day',
      });
    }

    // Fetch user for balance check
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate leave balances
    if (leaveType === 'Paid') {
      const availablePaid = user.leaveBalance?.paid || 0;
      if (daysCount > availablePaid) {
        return res.status(400).json({
          success: false,
          message: `Insufficient Paid leave balance. You requested ${daysCount} days, but only have ${availablePaid} days available.`,
        });
      }
    } else if (leaveType === 'Sick') {
      const availableSick = user.leaveBalance?.sick || 0;
      if (daysCount > availableSick) {
        return res.status(400).json({
          success: false,
          message: `Insufficient Sick leave balance. You requested ${daysCount} days, but only have ${availableSick} days available.`,
        });
      }
    }

    // Check for overlapping active leaves (Pending or Approved)
    const overlapping = await Leave.findOne({
      userId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: `You already have an active (${overlapping.status}) leave request overlapping from ${overlapping.startDate} to ${overlapping.endDate}.`,
      });
    }

    const newLeave = new Leave({
      userId,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason: reason.trim(),
      status: 'Pending',
    });

    await newLeave.save();

    res.status(201).json({
      success: true,
      message: `Leave application for ${daysCount} day(s) submitted successfully`,
      leave: newLeave,
    });
  } catch (error) {
    console.error('Apply Leave Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave application',
      error: error.message,
    });
  }
};

// @desc    Get employee personal leave history & balances
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const userId = (req.user.role === 'admin' && req.query.userId) ? req.query.userId : req.user._id;

    const user = await User.findById(userId).select('leaveBalance name employeeId');
    const leaves = await Leave.find({ userId })
      .populate('reviewedBy', 'name designation avatar')
      .sort({ createdAt: -1 });

    const stats = {
      totalApplications: leaves.length,
      pending: leaves.filter((l) => l.status === 'Pending').length,
      approved: leaves.filter((l) => l.status === 'Approved').length,
      rejected: leaves.filter((l) => l.status === 'Rejected').length,
    };

    res.status(200).json({
      success: true,
      leaveBalance: user.leaveBalance,
      stats,
      leaves,
    });
  } catch (error) {
    console.error('Get My Leaves Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave history',
      error: error.message,
    });
  }
};

// @desc    Get all leave requests across organization (Admin only)
// @route   GET /api/leaves/all
// @access  Private (Admin only)
const getAllLeaves = async (req, res) => {
  try {
    const { status, department, search } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    let leaves = await Leave.find(query)
      .populate('userId', 'name email employeeId department designation avatar leaveBalance')
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });

    // Filter populated user fields (department, search) in memory
    if (department && department !== 'All') {
      leaves = leaves.filter(
        (l) => l.userId && l.userId.department === department
      );
    }

    if (search) {
      const s = search.toLowerCase().trim();
      leaves = leaves.filter(
        (l) =>
          l.userId &&
          (l.userId.name.toLowerCase().includes(s) ||
            l.userId.email.toLowerCase().includes(s) ||
            l.userId.employeeId.toLowerCase().includes(s) ||
            l.reason.toLowerCase().includes(s))
      );
    }

    const allLeavesCount = await Leave.countDocuments();
    const pendingCount = await Leave.countDocuments({ status: 'Pending' });
    const approvedCount = await Leave.countDocuments({ status: 'Approved' });
    const rejectedCount = await Leave.countDocuments({ status: 'Rejected' });

    res.status(200).json({
      success: true,
      count: leaves.length,
      stats: {
        total: allLeavesCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      leaves,
    });
  } catch (error) {
    console.error('Get All Leaves Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leave applications',
      error: error.message,
    });
  }
};

// @desc    Approve or Reject leave request (Admin only)
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin only)
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment = '' } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const previousStatus = leave.status;
    const employee = await User.findById(leave.userId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Handle Leave Balance adjustments
    if (status === 'Approved' && previousStatus !== 'Approved') {
      // Deduct balance on transition to Approved
      if (leave.leaveType === 'Paid') {
        const available = employee.leaveBalance?.paid || 0;
        if (leave.daysCount > available) {
          return res.status(400).json({
            success: false,
            message: `Cannot approve. Employee only has ${available} Paid leave days available.`,
          });
        }
        employee.leaveBalance.paid -= leave.daysCount;
      } else if (leave.leaveType === 'Sick') {
        const available = employee.leaveBalance?.sick || 0;
        if (leave.daysCount > available) {
          return res.status(400).json({
            success: false,
            message: `Cannot approve. Employee only has ${available} Sick leave days available.`,
          });
        }
        employee.leaveBalance.sick -= leave.daysCount;
      }
      await employee.save();
    } else if (status === 'Rejected' && previousStatus === 'Approved') {
      // Refund balance if changing from Approved to Rejected
      if (leave.leaveType === 'Paid') {
        employee.leaveBalance.paid += leave.daysCount;
      } else if (leave.leaveType === 'Sick') {
        employee.leaveBalance.sick += leave.daysCount;
      }
      await employee.save();
    }

    // Update leave request
    leave.status = status;
    leave.adminComment = adminComment.trim();
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave request for ${employee.name} has been ${status.toLowerCase()} successfully`,
      leave,
      updatedBalance: employee.leaveBalance,
    });
  } catch (error) {
    console.error('Update Leave Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave status',
      error: error.message,
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
};
