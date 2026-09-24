const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendanceHistory,
  getMyWeeklyView,
  getAllAttendance,
  updateAttendanceRecord,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All attendance routes require JWT authentication
router.use(protect);

// Employee actions & personal logs
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/my-history', getMyAttendanceHistory);
router.get('/my-weekly', getMyWeeklyView);
router.get('/weekly-view', getMyWeeklyView);

// Admin oversight & management
router.get('/all', authorize('admin'), getAllAttendance);
router.put('/:id', authorize('admin'), updateAttendanceRecord);

module.exports = router;
