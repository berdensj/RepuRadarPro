import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  href: string;
  onClick: (e: React.MouseEvent) => void;
  badge?: number;
}

/**
 * SidebarItem component - ADA compliant navigation item
 * 
 * Features:
 * - Scalable font sizing using Tailwind utilities
 * - WCAG 2.2 compliant contrast ratios
 * - Proper touch target sizes
 * - Semantic HTML structure
 * - Keyboard navigable
 * - Screen reader support
 */
export function SidebarItem({
  icon,
  label,
  isActive,
  collapsed,
  href,
  onClick,
  badge
}: SidebarItemProps) {
  
  // Standard link component
  const linkContent = (
    <a
      href={href}
      className={cn(
        // Base styling with proper spacing
        "flex items-center rounded-md transition-colors",
        "py-3 px-4 w-full",
        // Ensure tap targets are large enough (44px minimum per WCAG)
        "min-h-[2.75rem]",
        // Standard text size for readability (16px base * 0.875 = 14px)
        "text-sm leading-normal",
        // Justify based on collapsed state
        collapsed ? "justify-center" : "",
        // Color contrast meets WCAG 2.2 guidelines (4.5:1 ratio)
        isActive 
          ? "bg-primary/15 text-primary font-medium" 
          : "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
      )}
      onClick={onClick}
      role="menuitem"
      aria-current={isActive ? "page" : undefined}
      // Clear and descriptive aria-label
      aria-label={`${label}${badge ? `, ${badge} unread items` : ''}${isActive ? ', current page' : ''}`}
    >
      {/* Icon container with badge support */}
      <div className="relative">
        <div className={cn(
          "flex-shrink-0", 
          collapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
        )}>
          {icon}
        </div>
        
        {/* Badge with proper contrast and accessibility */}
        {badge && (
          <span 
            className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white"
            aria-hidden="true"
          >
            {badge}
          </span>
        )}
      </div>
      
      {/* Only show text label when expanded */}
      {!collapsed && (
        <span className="truncate">{label}</span>
      )}
    </a>
  );
  
  // Wrap with tooltip only when collapsed
  return collapsed ? (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        {linkContent}
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
  ) : linkContent;
}