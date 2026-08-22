import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Sun,
  Moon,
  Mail,
  BadgeCheck,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import demoAvatars from '../utils/avatars';

const LoginPage = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'verify'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign up form state
  const [signupData, setSignupData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    role: 'employee', // 'employee' | 'admin'
    department: 'Engineering',
    designation: 'Software Engineer',
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Verification form state
  const [verifyEmailInput, setVerifyEmailInput] = useState('');
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [demoVerificationInfo, setDemoVerificationInfo] = useState(null);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL query parameters for token/email
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    const emailParam = params.get('email');
    if (tokenParam || emailParam) {
      setAuthMode('verify');
      if (tokenParam) setVerifyTokenInput(tokenParam);
      if (emailParam) setVerifyEmailInput(emailParam);
    }
  }, [location.search]);

  const handleLoginSubmit = async (e, customEmail, customPassword) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPassword || password;

    if (!loginEmail || !loginPass) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', { email: loginEmail, password: loginPass });
      setIsSubmitting(false);

      if (res.data.success) {
        localStorage.setItem('dayflow_token', res.data.token);
        localStorage.setItem('dayflow_user', JSON.stringify(res.data.user));
        toast.success(`Welcome to Dayflow, ${res.data.user.name}!`);

        const targetRoute =
          location.state?.from?.pathname ||
          (res.data.user.role === 'admin' ? '/admin' : '/employee');
        
        // Force window location or navigate to load fresh context
        window.location.href = targetRoute;
      }
    } catch (err) {
      setIsSubmitting(false);
      const data = err.response?.data;
      if (data?.unverified) {
        toast.error('Email not verified. Redirecting to verification...');
        setAuthMode('verify');
        setVerifyEmailInput(data.email || loginEmail);
        if (data.verificationToken) {
          setVerifyTokenInput(data.verificationToken);
        }
      } else {
        toast.error(data?.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupData.employeeId || !signupData.email || !signupData.password) {
      toast.error('Please fill in all required registration fields.');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/register', signupData);
      setIsSubmitting(false);

      if (res.data.success) {
        toast.success('Registration successful! Please verify your email.');
        setDemoVerificationInfo(res.data.demoVerification);
        setVerifyEmailInput(signupData.email);
        if (res.data.demoVerification?.token) {
          setVerifyTokenInput(res.data.demoVerification.token);
        }
        setAuthMode('verify');
      }
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleVerifySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!verifyTokenInput && !verifyEmailInput) {
      toast.error('Please enter the verification token or email');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/verify-email', {
        token: verifyTokenInput,
        email: verifyEmailInput,
      });
      setIsSubmitting(false);

      if (res.data.success) {
        toast.success('Account verified successfully! You can now sign in.');
        setEmail(verifyEmailInput);
        setAuthMode('login');
        setDemoVerificationInfo(null);
      }
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err.response?.data?.message || 'Verification failed. Invalid or expired token.');
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setAuthMode('login');
    handleLoginSubmit(null, demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-colors duration-200">
      {/* Background glowing orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header bar */}
      <header className="relative z-10 px-6 py-4 border-b border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/40 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Dayflow</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/30">
                HRMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center shadow-sm"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-block">
              Odoo x NMIT Hackathon Edition
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (Login / Sign Up / Verify Email) */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-9 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-200">
            
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('verify')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  authMode === 'verify'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Verify Email
              </button>
            </div>

            {/* TAB 1: SIGN IN */}
            {authMode === 'login' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Sign in to Dayflow
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    Workplace attendance, leave management, and payroll intelligence.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Work Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@dayflow.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* TAB 2: SIGN UP */}
            {authMode === 'signup' && (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Create Dayflow Account
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    Register a new Employee or HR Administrator identity.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
                  {/* Role Selector */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Organization Role *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupData({ ...signupData, role: 'employee' })}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                          signupData.role === 'employee'
                            ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-700 dark:text-brand-300'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        Employee
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupData({ ...signupData, role: 'admin' })}
                        className={`p-2.5 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                          signupData.role === 'admin'
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        HR / Admin
                      </button>
                    </div>
                  </div>

                  {/* Employee ID & Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Employee ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={signupData.employeeId}
                        onChange={(e) =>
                          setSignupData({ ...signupData, employeeId: e.target.value.toUpperCase() })
                        }
                        placeholder="e.g. EMP-007"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        placeholder="e.g. Vikramaditya Rao"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      placeholder="e.g. vikram@dayflow.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Password (min 6 characters) *
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        placeholder="Create a strong password"
                        className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      After sign-up, your account will be created in an <strong>Unverified</strong> state. You must verify your email before logging in.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register & Generate Token</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* TAB 3: VERIFY EMAIL */}
            {authMode === 'verify' && (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Verify Your Email
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    Enter your email and verification token to activate your account.
                  </p>
                </div>

                {demoVerificationInfo && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 mb-4 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Demo Verification Ready
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-200">
                      Token auto-populated below for instant hackathon verification.
                    </p>
                  </div>
                )}

                <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3.5 my-auto" />
                      <input
                        type="email"
                        required
                        value={verifyEmailInput}
                        onChange={(e) => setVerifyEmailInput(e.target.value)}
                        placeholder="e.g. vikram@dayflow.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Verification Token
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3.5 my-auto" />
                      <input
                        type="text"
                        required
                        value={verifyTokenInput}
                        onChange={(e) => setVerifyTokenInput(e.target.value)}
                        placeholder="Enter verification token"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <BadgeCheck className="w-4 h-4" />
                        <span>Verify & Activate Account</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

          </div>

          {/* Right Column: 1-Click Demo Accounts for Hackathon Judges */}
          <div className="lg:col-span-6 space-y-3">
            <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/40">
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-0.5">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                Hackathon Demo Quick Switcher
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Click any profile card below to sign in instantly with verified Indian demo accounts.
              </p>
            </div>

            {/* HR Admin Card - Priya Iyer */}
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@dayflow.com', 'admin123')}
              className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-brand-500/80 hover:bg-slate-50 dark:hover:bg-slate-850/90 transition-all group flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={demoAvatars.priya}
                  alt="Priya Iyer"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      Priya Iyer
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      HR Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">HR Manager • Bengaluru</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Employee 1 - Ananya Sharma (Engineering) */}
            <button
              type="button"
              onClick={() => handleQuickDemo('alex@dayflow.com', 'employee123')}
              className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-brand-500/80 hover:bg-slate-50 dark:hover:bg-slate-850/90 transition-all group flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={demoAvatars.ananya}
                  alt="Ananya Sharma"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      Ananya Sharma
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                      Engineering
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Senior Fullstack Dev • Bengaluru</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Employee 2 - Rohan Nair (UI/UX Design) */}
            <button
              type="button"
              onClick={() => handleQuickDemo('elena@dayflow.com', 'employee123')}
              className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-brand-500/80 hover:bg-slate-50 dark:hover:bg-slate-850/90 transition-all group flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={demoAvatars.rohan}
                  alt="Rohan Nair"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      Rohan Nair
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25">
                      Design
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lead UI/UX Designer • Bengaluru</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Employee 3 - Arjun Menon (Marketing) */}
            <button
              type="button"
              onClick={() => handleQuickDemo('marcus@dayflow.com', 'employee123')}
              className="w-full text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-brand-500/80 hover:bg-slate-50 dark:hover:bg-slate-850/90 transition-all group flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={demoAvatars.arjun}
                  alt="Arjun Menon"
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      Arjun Menon
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      Marketing
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Marketing Director • Mumbai</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-slate-950/60">
        Dayflow HRMS • Odoo x NMIT Hackathon 2026 • Made with ❤️ in India
      </footer>
    </div>
  );
};

export default LoginPage;
