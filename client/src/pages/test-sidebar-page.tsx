import { useEffect, useState } from "react";
import { SidebarLayout } from "@/components/layout/sidebar-layout";

export default function TestSidebarPage() {
  // Generate dummy content to test scrolling
  const [content, setContent] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    // Generate 30 paragraphs of content to test scrolling
    const dummyContent = Array.from({ length: 30 }).map((_, index) => (
      <div key={index} className="p-4 mb-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Section {index + 1}</h2>
        <p className="mb-3">
          This is a test paragraph to verify the sidebar scrolling behavior.
          As you scroll down the page, the sidebar should stay visible and not scroll independently.
        </p>
        <p className="mb-3">
          The sidebar should be positioned with "sticky" and "top-0" to ensure it remains
          fixed while the main content scrolls.
        </p>
        <p>
          The main container uses "min-h-screen" instead of a fixed height for proper scrolling.
        </p>
      </div>
    ));
    
    setContent(dummyContent);
  }, []);
  
  return (
    <SidebarLayout pageTitle="Test Sidebar Scrolling">
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h1 className="text-2xl font-bold mb-2">Sidebar Scrolling Test Page</h1>
          <p className="text-gray-600">
            This page is specifically designed to test the sidebar scrolling behavior.
            Scroll down to see the sidebar behavior as you move through content.
          </p>
        </div>
        
        {content}
      </div>
    </SidebarLayout>
  );
}