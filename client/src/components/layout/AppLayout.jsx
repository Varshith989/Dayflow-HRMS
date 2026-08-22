import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import EmployeeContextBanner from '../admin/EmployeeContextBanner';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex selection:bg-brand-500 selection:text-white transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-brand-500/5 dark:bg-brand-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[140px]"></div>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 relative z-10">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <EmployeeContextBanner />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
