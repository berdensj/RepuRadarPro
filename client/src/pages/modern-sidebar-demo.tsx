import { ModernLayout } from "@/components/dashboard/modern-sidebar/layout";

export default function ModernSidebarDemo() {
  return (
    <ModernLayout pageTitle="Modern Sidebar Demo">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Enhanced Sidebar Features</h2>
          <p className="mb-4">
            This page demonstrates the modern sidebar implementation with all the requested features:
          </p>
          
          <div className="space-y-4 pl-6">
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Static Sidebar on Desktop (≥1024px width)</p>
                <p className="text-sm text-gray-500">The sidebar remains fixed as you scroll the content.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Collapsible Behavior with Toggle Button</p>
                <p className="text-sm text-gray-500">Click the arrow button to collapse/expand the sidebar (or use Alt+S).</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Mobile-Responsive Design</p>
                <p className="text-sm text-gray-500">Off-canvas drawer with hamburger toggle on mobile devices.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Tooltips for Icons in Collapsed Mode</p>
                <p className="text-sm text-gray-500">Hover over icons when collapsed to see item labels.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Keyboard Accessibility</p>
                <p className="text-sm text-gray-500">Tab navigation and Alt+S shortcut for toggling the sidebar.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Notification Badges</p>
                <p className="text-sm text-gray-500">Red notification badges for Reviews and Alerts menu items.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrollable content for testing */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Scrollable Content</h2>
          <p className="mb-4">
            This content is here to demonstrate the fixed sidebar behavior as you scroll.
          </p>
          
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Section {i + 1}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                This is test content to make the page scrollable. The sidebar should remain fixed as you scroll 
                down this page. On desktop, it should be static on the left side. On mobile, it should be accessible
                via the hamburger menu.
              </p>
            </div>
          ))}
        </div>
      </div>
    </ModernLayout>
  );
}