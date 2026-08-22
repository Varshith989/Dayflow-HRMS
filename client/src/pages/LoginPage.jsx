import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Shield, User, Lock, ArrowRight, Eye, EyeOff, CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header bar */}
      <header className="relative z-10 px-6 py-5 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Dayflow</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                HRMS
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            Odoo x NMIT Hackathon Edition
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Login Form */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Sign in to your workplace
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Access your employee portal, attendance tracking, and HR operations.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@dayflow.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying session...</span>
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
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-800/40 backdrop-blur-md">
              <div className="flex items-center gap-2 text-brand-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                Hackathon Demo Quick Switcher
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any role card below to instantly populate credentials and test role permissions.
              </p>
            </div>

            {/* HR Admin Card */}
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@dayflow.com', 'admin123')}
              className="w-full text-left p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/80 hover:bg-slate-850/90 transition-all group flex items-center justify-between shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                      Sarah Jenkins
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      HR Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">admin@dayflow.com</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Employee 1 - Engineering */}
            <button
              type="button"
              onClick={() => handleQuickDemo('alex@dayflow.com', 'employee123')}
              className="w-full text-left p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/80 hover:bg-slate-850/90 transition-all group flex items-center justify-between shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                      Alex Rivera
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Engineering
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">alex@dayflow.com</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Employee 2 - Design */}
            <button
              type="button"
              onClick={() => handleQuickDemo('elena@dayflow.com', 'employee123')}
              className="w-full text-left p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/80 hover:bg-slate-850/90 transition-all group flex items-center justify-between shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                      Elena Rostova
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      UI/UX Design
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">elena@dayflow.com</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/60">
        Dayflow HRMS • Odoo x NMIT Hackathon 2026
      </footer>
    </div>
  );
};

export default LoginPage;
