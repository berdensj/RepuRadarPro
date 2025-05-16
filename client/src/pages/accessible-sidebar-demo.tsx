import { AccessibleLayout } from "@/components/dashboard/enhanced-sidebar/AccessibleLayout";

export default function AccessibleSidebarDemo() {
  return (
    <AccessibleLayout pageTitle="ADA-Compliant Sidebar">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">ADA and UI/UX Enhancements</h2>
          <p className="mb-4">
            This enhanced sidebar implementation follows WCAG 2.2 guidelines and UI/UX best practices for accessibility.
          </p>
          
          <div className="space-y-4 pl-6">
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Improved Font Sizing</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Using scalable units (text-sm, text-base) instead of fixed pixel sizes for better readability.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">200% Zoom Support</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Layout remains usable when zoomed to 200%, with no text overflow or layout breaking.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Improved Contrast Ratio</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  All text meets WCAG 2.2 contrast requirements (4.5:1 minimum ratio) for better readability.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Keyboard Navigation</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Full keyboard support with <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Tab</kbd> 
                  navigation and <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Alt+S</kbd> shortcut.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Semantic HTML</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Using proper HTML tags (nav, ul, li) with ARIA attributes for screen readers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center mr-2 mt-0.5">✓</span>
              <div>
                <p className="font-medium">Touch-Friendly Targets</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Minimum 44px (2.75rem) touch target size for all interactive elements.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Component Architecture</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">File Structure</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li><code>AccessibleSidebar.tsx</code> - Main sidebar component with ADA compliance</li>
                <li><code>SidebarItem.tsx</code> - Individual navigation item component</li>
                <li><code>SidebarDropdown.tsx</code> - Dropdown/submenu component</li>
                <li><code>AccessibleLayout.tsx</code> - Layout wrapper for content area</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Accessibility Features</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Skip to content link for keyboard users</li>
                <li>ARIA labels and roles for all interactive elements</li>
                <li>Screen reader announcements for state changes</li>
                <li>Focus management and visible focus indicators</li>
                <li>Responsive to font size changes and zoom levels</li>
                <li>Color contrast meeting WCAG 2.2 guidelines</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Scrollable content for testing */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test Your Accessibility Features</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Try These Tests:</h3>
              <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>Zoom the browser to 200% (Ctrl/Cmd + '+') and verify the sidebar remains usable</li>
                <li>Navigate using only the Tab key to verify keyboard accessibility</li>
                <li>Use Alt+S to toggle the sidebar collapse state</li>
                <li>Toggle between light and dark modes to check contrast</li>
                <li>Try collapsing the sidebar and hover over icons to see tooltips</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-medium mb-3">Scrolling Test Content</h3>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="py-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium">Section {i + 1}</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  This section demonstrates how the sidebar stays fixed while you scroll down the page content.
                  The content area scales properly with font size changes and zoom levels.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AccessibleLayout>
  );
}