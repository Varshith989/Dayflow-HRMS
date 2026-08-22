import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Shield, User, Lock, ArrowRight, Eye, EyeOff, Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import demoAvatars from '../utils/avatars';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (e, customEmail, customPassword) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPassword || password;

    if (!loginEmail || !loginPass) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginEmail, loginPass);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome to Dayflow, ${result.user.name}!`);
      const targetRoute =
        location.state?.from?.pathname ||
        (result.user.role === 'admin' ? '/admin' : '/employee');
      navigate(targetRoute, { replace: true });
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
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
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Login Form */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-200">
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sign in to Dayflow
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                Workplace attendance, leave requests, and payroll intelligence.
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
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
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
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
          </div>

          {/* Right Column: 1-Click Demo Accounts for Hackathon Judges */}
          <div className="lg:col-span-6 space-y-3">
            <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/40">
              <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-0.5">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                Hackathon Demo Quick Switcher
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Click any profile card below to sign in instantly with Indian demo accounts.
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
