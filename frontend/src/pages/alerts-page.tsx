import React from 'react';
import { Sidebar } from '../components/dashboard/sidebar';
import { AlertCenter } from '../components/dashboard/alert-center';
import { useIsMobile } from '../hooks/use-mobile';
import { Helmet } from 'react-helmet';

export default function AlertsPage() {
  const isMobile = useIsMobile();

  return (
    <>
      <Helmet>
        <title>Alerts | Reputation Sentinel</title>
        <meta name="description" content="View and manage alerts for your online reputation on Reputation Sentinel." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6 bg-slate-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">Alerts</h1>
              <p className="text-slate-500">Stay updated on important reputation issues</p>
            </header>

            {/* Alert Center expanded view */}
            <AlertCenter />
          </div>
        </main>
      </div>
    </>
  );
}