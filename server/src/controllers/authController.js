const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const demoAvatars = require('../utils/avatars');

// Helper to generate JWT
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'dayflow_hackathon_jwt_secret_key_987654321_secure',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register / Sign up a new user (Employee or HR)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    let { employeeId, name, email, password, role, department, designation } = req.body;

    if (!employeeId || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Employee ID, Email, and Password',
      });
    }

    employeeId = employeeId.trim().toUpperCase();
    email = email.toLowerCase().trim();

    // Validate email regex
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Role mapping / validation (HR maps to admin)
    let assignedRole = 'employee';
    if (role) {
      const normalizedRole = role.toLowerCase().trim();
      if (normalizedRole === 'hr' || normalizedRole === 'admin') {
        assignedRole = 'admin';
      } else {
        assignedRole = 'employee';
      }
    }

    // Check duplicate employee ID
    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({
        success: false,
        message: `An employee with ID '${employeeId}' is already registered.`,
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `An account with email '${email}' is already registered.`,
      });
    }

    // Default name if none provided
    const fullName = name && name.trim() ? name.trim() : email.split('@')[0].replace('.', ' ');

    // Generate unique verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const initialDocuments = [
      {
        name: 'Appointment_Letter.pdf',
        type: 'Offer Letter',
        fileSize: '1.2 MB',
        status: 'Verified',
        uploadedAt: new Date(),
      },
      {
        name: 'Government_Identity_Proof.pdf',
        type: 'Government ID',
        fileSize: '0.8 MB',
        status: 'Pending Verification',
        uploadedAt: new Date(),
      },
    ];

    const newUser = new User({
      employeeId,
      name: fullName,
      email,
      password,
      role: assignedRole,
      department: department || (assignedRole === 'admin' ? 'Human Resources' : 'Engineering'),
      designation: designation || (assignedRole === 'admin' ? 'HR Specialist' : 'Associate Engineer'),
      avatar: demoAvatars.generic(fullName.slice(0, 2).toUpperCase()),
      status: 'Active',
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      documents: initialDocuments,
      leaveBalance: { paid: 12, sick: 8, unpaid: 0 },
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message:
        'Registration successful! Please verify your email address to activate your account.',
      user: {
        id: newUser._id,
        employeeId: newUser.employeeId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: false,
      },
      // Provided for easy hackathon demo verification flow
      demoVerification: {
        token: verificationToken,
        verifyUrl: `/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`,
        instructions: 'Click Verify Now or submit this token to activate your account.',
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register new account',
      error: error.message,
    });
  }
};

// @desc    Verify email using token
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a verification token',
      });
    }

    const query = {};
    if (token) query.verificationToken = token.trim();
    if (email) query.email = email.toLowerCase().trim();

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token or email address.',
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. You can proceed to login.',
      });
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new verification token.',
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log into Dayflow HRMS.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email address',
      error: error.message,
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Explicitly query user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact your HR administrator.',
      });
    }

    // Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.',
      });
    }

    // Verify email verification state
    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: 'Email address not verified. Please verify your email before logging in.',
        unverified: true,
        email: user.email,
        verificationToken: user.verificationToken,
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar,
        status: user.status,
        isVerified: user.isVerified,
        leaveBalance: user.leaveBalance,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
    });
  }
};

// @desc    Log out user / invalidate session
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  verifyEmail,
  login,
  getMe,
  logout,
};
