const User = require('../models/User');

// @desc    Get all employees with search, filter, and pagination
// @route   GET /api/users
// @access  Private (Admin only)
const getAllEmployees = async (req, res) => {
  try {
    const { search, department, status, role } = req.query;

    const query = {};

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by role
    if (role && role !== 'All') {
      query.role = role;
    }

    // Search by name, email, employeeId, or designation
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { designation: searchRegex },
        { department: searchRegex },
      ];
    }

    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Extract unique departments for filter dropdown
    const departments = await User.distinct('department');

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      departments,
      employees,
    });
  } catch (error) {
    console.error('Get All Employees Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee directory',
      error: error.message,
    });
  }
};

// @desc    Get single employee details
// @route   GET /api/users/:id
// @access  Private (Admin or Self)
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Non-admins can only view their own profile or public team info
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      // Allow viewing basic profile of colleagues
      const colleague = await User.findById(id).select(
        'name email employeeId department designation avatar status'
      );
      if (!colleague) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      return res.status(200).json({ success: true, employee: colleague });
    }

    const employee = await User.findById(id).select('-password');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error('Get Employee By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee details',
      error: error.message,
    });
  }
};

// @desc    Create/Onboard a new employee
// @route   POST /api/users
// @access  Private (Admin only)
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      department,
      designation,
      phone,
      joiningDate,
      avatar,
      address,
      emergencyContact,
      leaveBalance,
    } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, department, and designation',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email address already exists',
      });
    }

    // Generate unique employee ID if not provided (e.g. EMP-005)
    let employeeId = req.body.employeeId;
    if (!employeeId) {
      const count = await User.countDocuments();
      employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    // Default password if none provided
    const userPassword = password || 'dayflow123';

    const newEmployee = new User({
      employeeId,
      name,
      email: email.toLowerCase().trim(),
      password: userPassword,
      role,
      department,
      designation,
      phone: phone || '',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      avatar:
        avatar ||
        `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000000)}?auto=format&fit=crop&q=80&w=256`,
      status: 'Active',
      address: address || {},
      emergencyContact: emergencyContact || {},
      leaveBalance: leaveBalance || { paid: 12, sick: 8, unpaid: 0 },
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: `Employee ${newEmployee.name} onboarded successfully with ID ${newEmployee.employeeId}`,
      employee: newEmployee,
    });
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create new employee',
      error: error.message,
    });
  }
};

// @desc    Update employee profile
// @route   PUT /api/users/:id
// @access  Private (Admin for all fields, Employee for personal info)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const isSelf = req.user._id.toString() === id;
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
    }

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Fields employee is allowed to edit for themselves
    if (isSelf && !isAdmin) {
      const { phone, address, emergencyContact, avatar } = req.body;
      if (phone !== undefined) employee.phone = phone;
      if (avatar !== undefined) employee.avatar = avatar;
      if (address) employee.address = { ...employee.address, ...address };
      if (emergencyContact)
        employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    }

    // Admin can update everything
    if (isAdmin) {
      const {
        name,
        email,
        role,
        department,
        designation,
        phone,
        status,
        avatar,
        address,
        emergencyContact,
        leaveBalance,
        joiningDate,
      } = req.body;

      if (name) employee.name = name;
      if (email) employee.email = email.toLowerCase().trim();
      if (role) employee.role = role;
      if (department) employee.department = department;
      if (designation) employee.designation = designation;
      if (phone !== undefined) employee.phone = phone;
      if (status) employee.status = status;
      if (avatar) employee.avatar = avatar;
      if (joiningDate) employee.joiningDate = new Date(joiningDate);
      if (address) employee.address = { ...employee.address, ...address };
      if (emergencyContact)
        employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
      if (leaveBalance)
        employee.leaveBalance = { ...employee.leaveBalance, ...leaveBalance };
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      employee,
    });
  } catch (error) {
    console.error('Update Employee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee profile',
      error: error.message,
    });
  }
};

// @desc    Delete/Deactivate employee
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own account',
      });
    }

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Soft delete / deactivate by default
    employee.status = 'Inactive';
    await employee.save();

    res.status(200).json({
      success: true,
      message: `Employee ${employee.name} deactivated successfully`,
    });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message,
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
