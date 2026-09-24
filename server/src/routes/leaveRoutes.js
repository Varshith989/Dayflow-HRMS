const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

// All leave endpoints require JWT authentication
router.use(protect);

// Employee actions
router.post('/', applyLeave);
router.get('/my-leaves', getMyLeaves);

// Admin actions
router.get('/all', authorize('admin'), getAllLeaves);
router.put('/:id/status', authorize('admin'), updateLeaveStatus);

module.exports = router;
