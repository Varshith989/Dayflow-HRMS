const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } = require('date-fns');

// Helper to get formatted date string YYYY-MM-DD
const getTodayDateStr = () => format(new Date(), 'yyyy-MM-dd');

// @desc    Check-in for today
// @route   POST /api/attendance/check-in
// @access  Private (Employee / Admin for self)
const checkIn = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayDateStr();
    const { workMode = 'Office', remarks = '' } = req.body;

    // Check if attendance already recorded today
    let attendance = await Attendance.findOne({ userId, date: todayStr });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: `You have already checked in today at ${format(
          new Date(attendance.checkIn),
          'hh:mm a'
        )}`,
      });
    }

    if (!attendance) {
      attendance = new Attendance({
        userId,
        date: todayStr,
        checkIn: new Date(),
        workMode,
        remarks: remarks || 'Checked in on time',
        status: 'Present',
      });
    } else {
      attendance.checkIn = new Date();
      attendance.workMode = workMode;
      attendance.status = 'Present';
      if (remarks) attendance.remarks = remarks;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Punch-in recorded successfully at ${format(
        attendance.checkIn,
        'hh:mm a'
      )} (${workMode})`,
      attendance,
    });
  } catch (error) {
    console.error('CheckIn Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record check-in',
      error: error.message,
    });
  }
};

// @desc    Check-out for today
// @route   POST /api/attendance/check-out
// @access  Private (Employee / Admin for self)
const checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = getTodayDateStr();
    const { remarks } = req.body;

    const attendance = await Attendance.findOne({ userId, date: todayStr });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'You have not checked in today. Please check in first.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: `You have already checked out today at ${format(
          new Date(attendance.checkOut),
          'hh:mm a'
        )}`,
      });
    }

    const checkOutTime = new Date();
    attendance.checkOut = checkOutTime;

    // Calculate working hours in decimals
    const durationMs = checkOutTime - new Date(attendance.checkIn);
    const hours = Math.max(0, durationMs / (1000 * 60 * 60));
    attendance.totalHours = parseFloat(hours.toFixed(2));

    // Determine status based on hours worked
    if (attendance.totalHours >= 7.5) {
      attendance.status = 'Present';
    } else if (attendance.totalHours >= 4.0) {
      attendance.status = 'Half-day';
    } else {
      attendance.status = 'Half-day';
    }

    if (remarks) {
      attendance.remarks = attendance.remarks
        ? `${attendance.remarks} | ${remarks}`
        : remarks;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Punch-out recorded successfully at ${format(
        checkOutTime,
        'hh:mm a'
      )}. Total hours: ${attendance.totalHours} hrs`,
      attendance,
    });
  } catch (error) {
    console.error('CheckOut Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record check-out',
      error: error.message,
    });
  }
};

// @desc    Get today's attendance status for logged-in user
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const userId = (req.user.role === 'admin' && req.query.userId) ? req.query.userId : req.user._id;
    const todayStr = getTodayDateStr();

    const attendance = await Attendance.findOne({ userId, date: todayStr });

    res.status(200).json({
      success: true,
      date: todayStr,
      attendance: attendance || null,
      isCheckedIn: !!(attendance && attendance.checkIn),
      isCheckedOut: !!(attendance && attendance.checkOut),
    });
  } catch (error) {
    console.error('Today Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today attendance status',
      error: error.message,
    });
  }
};

// @desc    Get personal attendance history with monthly stats
// @route   GET /api/attendance/my-history
// @access  Private
const getMyAttendanceHistory = async (req, res) => {
  try {
    const userId = (req.user.role === 'admin' && req.query.userId) ? req.query.userId : req.user._id;
    const { month, year, limit = 30 } = req.query;

    const query = { userId };

    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${monthStr}` };
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit, 10));

    // Summary calculation
    const totalRecords = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const halfDayCount = records.filter((r) => r.status === 'Half-day').length;
    const leaveCount = records.filter((r) => r.status === 'Leave').length;
    const totalHoursWorked = records.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const avgDailyHours = totalRecords > 0 ? (totalHoursWorked / totalRecords).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalRecords,
        presentCount,
        halfDayCount,
        leaveCount,
        totalHoursWorked: totalHoursWorked.toFixed(1),
        avgDailyHours,
      },
      records,
    });
  } catch (error) {
    console.error('Attendance History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance history',
      error: error.message,
    });
  }
};

// @desc    Get current week attendance view (Mon - Sun)
// @route   GET /api/attendance/my-weekly
// @access  Private
const getMyWeeklyView = async (req, res) => {
  try {
    const userId = (req.user.role === 'admin' && req.query.userId) ? req.query.userId : req.user._id;
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday end

    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const dateStrings = days.map((d) => format(d, 'yyyy-MM-dd'));

    const records = await Attendance.find({
      userId,
      date: { $in: dateStrings },
    });

    const recordMap = {};
    records.forEach((r) => {
      recordMap[r.date] = r;
    });

    const weeklyDays = days.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const isPastOrToday = d <= today;
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const record = recordMap[dateStr];

      let status = 'Upcoming';
      if (record) {
        status = record.status;
      } else if (isPastOrToday) {
        status = isWeekend ? 'Weekend' : 'Absent';
      }

      return {
        date: dateStr,
        dayName: format(d, 'EEEE'),
        shortDay: format(d, 'EEE'),
        dayNumber: format(d, 'd'),
        isToday: dateStr === getTodayDateStr(),
        status,
        checkIn: record?.checkIn || null,
        checkOut: record?.checkOut || null,
        totalHours: record?.totalHours || 0,
        workMode: record?.workMode || (isWeekend ? 'Weekend' : 'Office'),
        remarks: record?.remarks || '',
      };
    });

    res.status(200).json({
      success: true,
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      weekEnd: format(weekEnd, 'yyyy-MM-dd'),
      weeklyDays,
    });
  } catch (error) {
    console.error('Weekly View Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly attendance view',
      error: error.message,
    });
  }
};

// @desc    Get all attendance records (Admin only)
// @route   GET /api/attendance/all
// @access  Private (Admin only)
const getAllAttendance = async (req, res) => {
  try {
    const { date, department, status, search } = req.query;

    const query = {};

    // Filter by specific date (defaults to today if not provided)
    if (date) {
      query.date = date;
    } else {
      query.date = getTodayDateStr();
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let records = await Attendance.find(query)
      .populate('userId', 'name email employeeId department designation avatar status')
      .sort({ createdAt: -1 });

    // Filter populated user fields (department, search) in memory
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

    // Compute organization roll-call statistics for the requested date
    const totalPresent = records.filter((r) => r.status === 'Present').length;
    const totalHalfDay = records.filter((r) => r.status === 'Half-day').length;
    const totalLeave = records.filter((r) => r.status === 'Leave').length;

    res.status(200).json({
      success: true,
      date: query.date,
      count: records.length,
      stats: {
        totalPresent,
        totalHalfDay,
        totalLeave,
      },
      records,
    });
  } catch (error) {
    console.error('Get All Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve company attendance',
      error: error.message,
    });
  }
};

// @desc    Admin regularize / update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin only)
const updateAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, totalHours, workMode, remarks } = req.body;

    const record = await Attendance.findById(id).populate(
      'userId',
      'name employeeId email'
    );
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (status) record.status = status;
    if (checkIn) record.checkIn = new Date(checkIn);
    if (checkOut) record.checkOut = new Date(checkOut);
    if (totalHours !== undefined) record.totalHours = Number(totalHours);
    if (workMode) record.workMode = workMode;
    if (remarks) record.remarks = remarks;

    await record.save();

    res.status(200).json({
      success: true,
      message: `Attendance for ${record.userId?.name || 'Employee'} updated successfully`,
      record,
    });
  } catch (error) {
    console.error('Update Attendance Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendance record',
      error: error.message,
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getMyWeeklyView,
  getAllAttendance,
  updateAttendanceRecord,
};
