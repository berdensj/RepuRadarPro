import { useState, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarDropdownProps {
  icon: React.ReactNode;
  label: string;
  children: ReactNode;
  isExpanded: boolean;
  hasActiveChild: boolean;
  collapsed: boolean;
  badge?: number;
  onToggle: () => void;
}

/**
 * SidebarDropdown component - ADA compliant navigation dropdown
 * 
 * Features:
 * - Scalable font sizing using Tailwind utilities
 * - WCAG 2.2 compliant contrast ratios
 * - Proper touch target sizes
 * - Semantic HTML structure for screen readers
 * - Keyboard navigable with proper ARIA controls
 */
export function SidebarDropdown({
  icon,
  label,
  children,
  isExpanded,
  hasActiveChild,
  collapsed,
  badge,
  onToggle
}: SidebarDropdownProps) {
  const menuId = `${label.toLowerCase().replace(/\s+/g, '-')}-submenu`;
  
  // Header button with appropriate ARIA attributes
  const headerButton = (
    <button
      className={cn(
        // Base styling with proper spacing and sizing
        "flex items-center rounded-md transition-colors",
        "py-3 px-4 w-full",
        // Ensure tap targets are large enough (44px minimum per WCAG)
        "min-h-[2.75rem]",
        // Text styling (16px base * 0.875 = 14px)
        "text-sm leading-normal",
        // Justify based on collapsed state
        collapsed ? "justify-center" : "justify-between",
        // High contrast colors that meet WCAG guidelines
        hasActiveChild 
          ? "bg-primary/15 text-primary font-medium" 
          : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-haspopup="true"
      aria-controls={menuId}
      aria-label={`${label} menu${badge ? `, ${badge} unread items` : ''}${hasActiveChild ? ', contains active item' : ''}, ${isExpanded ? 'collapse' : 'expand'}`}
    >
      <div className="flex items-center">
        <div className="relative">
          <div className={cn(
            "flex-shrink-0", 
            collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
          )}>
            {icon}
          </div>
          
          {/* Badge with proper contrast */}
          {badge && (
            <span 
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white"
              aria-hidden="true"
            >
              {badge}
            </span>
          )}
        </div>
        
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
      
      {/* Chevron indicator for dropdown state */}
      {!collapsed && (
        <ChevronRight 
          className={cn(
            "h-4 w-4 transform transition-transform",
            isExpanded && "rotate-90"
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
  
  return (
    <div className="relative">
      {/* Wrap with tooltip when collapsed */}
      {collapsed ? (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {headerButton}
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="z-50">
            <div className="flex flex-col">
              <span className="font-medium">{label}</span>
              {badge && (
                <span className="text-xs text-gray-500">
                  {badge} unread {badge === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      ) : headerButton}
      
      {/* Submenu container with proper ARIA relationship */}
      {isExpanded && (
        <div
          id={menuId}
          className={cn(
            collapsed 
              ? "absolute left-full top-0 mt-0 ml-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-700 py-1 z-50" 
              : "mt-1 ml-8 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2"
          )}
          role="menu"
          aria-labelledby={`${label.toLowerCase().replace(/\s+/g, '-')}-button`}
        >
          {children}
        </div>
      )}
    </div>
  );
}