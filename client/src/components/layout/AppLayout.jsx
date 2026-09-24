import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import EmployeeContextBanner from '../admin/EmployeeContextBanner';
import CommandPalette from '../common/CommandPalette';
import api from '../../api/client';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Warm up data cache in background for instant 0ms tab switching
  useEffect(() => {
    const warmCache = () => {
      api.prefetch('/attendance/all');
      api.prefetch('/users');
      api.prefetch('/leaves/all?status=Pending');
      api.prefetch('/leaves/all');
      api.prefetch('/salaries/all', { params: { month: 8, year: 2026 } });
      api.prefetch('/attendance/my-history');
      api.prefetch('/leaves/my-leaves');
      api.prefetch('/salaries/my-payslips');
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(warmCache);
    } else {
      const timer = setTimeout(warmCache, 250);
      return () => clearTimeout(timer);
    }
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-150 antialiased font-sans">
      {/* Subtle enterprise surface gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/3 w-[600px] h-[350px] bg-brand-500/[0.03] dark:bg-brand-500/[0.04] rounded-full blur-[140px]" />
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-200 ${
          isCollapsed ? 'lg:pl-18' : 'lg:pl-64'
        }`}
      >
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <EmployeeContextBanner />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
