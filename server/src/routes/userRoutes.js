const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getUserDocuments,
  addUserDocument,
  deleteUserDocument,
  verifyUserDocument,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(authorize('admin'), getAllEmployees)
  .post(authorize('admin'), createEmployee);

// Shortcut for user updating own profile
router.put('/profile', (req, res) => {
  req.params.id = req.user._id.toString();
  return updateEmployee(req, res);
});

// Employee document routes
router.route('/:id/documents')
  .get(getUserDocuments)
  .post(addUserDocument);

router.delete('/:id/documents/:docId', deleteUserDocument);
router.put('/:id/documents/:docId/status', authorize('admin'), verifyUserDocument);

router.route('/:id')
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
