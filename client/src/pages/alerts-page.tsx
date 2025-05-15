import { AlertCenter } from "@/components/dashboard/alert-center";
import { Helmet } from "react-helmet";

export default function AlertsPage() {
  return (
    <>
      <Helmet>
        <title>Alerts | RepuRadar</title>
        <meta name="description" content="View important alerts about negative reviews and trending issues with your reputation." />
      </Helmet>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <p className="text-slate-500">Stay updated on important reputation issues</p>
        </header>

        {/* Alert Center expanded view */}
        <AlertCenter />
      </div>
    </>
  );
}