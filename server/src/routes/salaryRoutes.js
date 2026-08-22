const express = require('express');
const router = express.Router();
const {
  getMyPayslips,
  getAllPayroll,
  createSalaryRecord,
  updateSalaryRecord,
} = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/auth');

// All salary/payroll endpoints require authentication
router.use(protect);

// Employee read-only endpoint
router.get('/my-payslips', getMyPayslips);

// Admin management endpoints
router.get('/all', authorize('admin'), getAllPayroll);
router.post('/', authorize('admin'), createSalaryRecord);
router.put('/:id', authorize('admin'), updateSalaryRecord);

module.exports = router;
