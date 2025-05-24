import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './dashboard/header'; // Assuming header is in dashboard, adjust if needed

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64"> {/* ml-64 for sidebar width */}
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 