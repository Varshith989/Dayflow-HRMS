import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Shield, User, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const Topbar = ({ onMenuClick }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/employee') return 'Dashboard Overview';
    if (path.includes('/employees')) return 'Employee Directory & Onboarding';
    if (path.includes('/attendance')) return isAdmin ? 'Company Attendance Feed' : 'My Daily Attendance';
    if (path.includes('/leaves')) return isAdmin ? 'Leave Management & Approvals' : 'Time Off & Leave Portal';
    if (path.includes('/payroll') || path.includes('/salary')) return isAdmin ? 'Payroll Management' : 'My Monthly Payslips';
    if (path.includes('/profile')) return 'My Personal & Work Profile';
    return 'Dayflow Portal';
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {getPageTitle()}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Dayflow</span>
            <span>•</span>
            <span className="capitalize">{user?.role} Portal</span>
          </div>
        </div>
      </div>

      {/* Right: Live Clock, Role Badge, and Profile Link */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          <span>{format(currentTime, 'EEE, dd MMM • HH:mm:ss')}</span>
        </div>

        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
          {isAdmin ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-indigo-400" />}
          <span className="capitalize">{isAdmin ? 'HR Admin' : 'Employee'}</span>
        </div>

        {/* Avatar Profile Link */}
        <Link
          to={isAdmin ? '/admin/profile' : '/employee/profile'}
          className="flex items-center gap-2.5 p-1.5 pl-2 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group"
        >
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
              {user?.name}
            </div>
            <div className="text-[10px] text-slate-400">{user?.department}</div>
          </div>
          <img
            src={
              user?.avatar ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256'
            }
            alt={user?.name}
            className="w-8 h-8 rounded-xl object-cover border border-slate-700 group-hover:border-brand-500 transition-colors"
          />
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
