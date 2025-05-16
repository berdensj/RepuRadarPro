import { EnhancedLayout } from "@/components/dashboard/enhanced-sidebar/layout";

export default function EnhancedSidebarDemo() {
  return (
    <EnhancedLayout pageTitle="Enhanced Sidebar Demo">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Enhanced Sidebar Features</h2>
          <p className="mb-4">
            This demo showcases the enhanced sidebar implementation with all requested features:
          </p>
          
          <div className="space-y-4 pl-6">
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Static Layout on Desktop</p>
                <p className="text-sm text-gray-500">Fixed on the left side of the screen for widths ≥1024px, remains visible while content scrolls.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Scrollable Navigation</p>
                <p className="text-sm text-gray-500">Main navigation items scroll independently when they exceed the viewport height.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Pinned Footer Actions</p>
                <p className="text-sm text-gray-500">User profile and action buttons remain fixed at the bottom of the sidebar regardless of scroll position.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Responsive Design</p>
                <p className="text-sm text-gray-500">Sidebar collapses on smaller screens with hamburger menu toggle for mobile devices.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Precise Width Control</p>
                <p className="text-sm text-gray-500">Expanded width: 240px, Collapsed width: 60px with icons only and tooltips on hover.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Accessibility</p>
                <p className="text-sm text-gray-500">Full keyboard navigation support, ARIA attributes, tooltips, and screen reader announcements.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Keyboard Shortcuts</p>
                <p className="text-sm text-gray-500">Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">Alt+S</kbd> to toggle sidebar expansion state.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Component Structure</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li><code>/components/dashboard/enhanced-sidebar/index.tsx</code> - Core sidebar component</li>
                <li><code>/components/dashboard/enhanced-sidebar/layout.tsx</code> - Layout wrapper with content area</li>
                <li><code>/pages/enhanced-sidebar-demo.tsx</code> - This demo page</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Key Technical Features</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>Uses Flexbox for layout with proper header, navigation, and footer sections</li>
                <li>Stores sidebar state in localStorage for persistence across page reloads</li>
                <li>Manages keyboard event listeners for shortcuts and accessibility</li>
                <li>Conditionally renders tooltips based on sidebar collapsed state</li>
                <li>Properly announces sidebar state changes to screen readers</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Scrollable content for testing */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Scrollable Content</h2>
          <p className="mb-4">
            Scroll down to test the fixed sidebar behavior. The sidebar should remain in place while this content scrolls.
          </p>
          
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Section {i + 1}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                This section demonstrates how the sidebar stays fixed while you scroll down the page content.
                On desktop (≥1024px width), the sidebar remains visible. On mobile devices, it becomes an off-canvas
                drawer that can be toggled with the hamburger menu button.
              </p>
            </div>
          ))}
        </div>
      </div>
    </EnhancedLayout>
  );
}