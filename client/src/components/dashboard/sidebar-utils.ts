import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { NavItem, SimpleNavItem, GroupNavItem, SeparatorItem } from './sidebar-config';

/**
 * Check if an item is a separator
 * @param item - Navigation item to check
 * @returns Whether the item is a separator
 */
export function isSeparator(item: NavItem): item is SeparatorItem {
  return 'type' in item && item.type === 'separator';
}

/**
 * Check if an item is a simple navigation item
 * @param item - Navigation item to check
 * @returns Whether the item is a simple navigation item
 */
export function isSimpleNavItem(item: NavItem): item is SimpleNavItem {
  return 'type' in item && item.type === 'item';
}

/**
 * Check if an item is a group navigation item
 * @param item - Navigation item to check
 * @returns Whether the item is a group navigation item
 */
export function isGroupNavItem(item: NavItem): item is GroupNavItem {
  return 'type' in item && item.type === 'group';
}

/**
 * Hook to manage sidebar expanded groups state
 * - Initializes from localStorage if available
 * - Persists changes to localStorage
 * @returns expandedGroups object and toggle function
 */
export function useSidebarGroups() {
  // Initialize from localStorage if available
  const initialGroups = (() => {
    if (typeof window === 'undefined') return {};
    
    try {
      const saved = localStorage.getItem('repuradar_sidebar_groups');
      return saved ? JSON.parse(saved) : {
        reviews: false,
        analytics: false,
        management: false,
        config: false,
        account: false,
        admin: false,
        systemAdmin: false
      };
    } catch (e) {
      return {
        reviews: false,
        analytics: false,
        management: false,
        config: false,
        account: false,
        admin: false,
        systemAdmin: false
      };
    }
  })();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(initialGroups);
  
  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('repuradar_sidebar_groups', JSON.stringify(expandedGroups));
    } catch (e) {
      // Ignore storage errors
    }
  }, [expandedGroups]);
  
  // Toggle a group's expanded state
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  return { expandedGroups, toggleGroup, setExpandedGroups };
}

/**
 * Hook to manage sidebar collapsed state
 * - Initializes from localStorage if available
 * - Persists changes to localStorage
 * @returns sidebarCollapsed state and toggle function
 */
export function useSidebarCollapsed() {
  // Initialize from localStorage if available
  const initialCollapsed = (() => {
    if (typeof window === 'undefined') return false;
    
    try {
      const saved = localStorage.getItem('repuradar_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  })();

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(initialCollapsed);
  
  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('repuradar_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
    } catch (e) {
      // Ignore storage errors
    }
  }, [sidebarCollapsed]);
  
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  
  return { sidebarCollapsed, toggleSidebar, setSidebarCollapsed };
}

/**
 * Auto-expand groups when a child item is active
 * @param location - Current route location
 * @param expandedGroups - Current expanded groups state
 * @param setExpandedGroups - Function to update expanded groups
 * @param navItems - Navigation items to check
 */
export function useAutoExpandActiveGroups(
  location: string,
  expandedGroups: Record<string, boolean>,
  setExpandedGroups: (value: React.SetStateAction<Record<string, boolean>>) => void,
  navItems: Record<string, any>
) {
  useEffect(() => {
    // Check if the current location matches any child item
    const checkAndOpenGroup = (groupName: string, children: SimpleNavItem[]) => {
      const isActive = children.some(item => item.href === location);
      if (isActive && !expandedGroups[groupName]) {
        setExpandedGroups(prev => ({
          ...prev,
          [groupName]: true
        }));
      }
    };
    
    // Look through all group nav items
    Object.entries(navItems).forEach(([key, item]) => {
      if (isGroupNavItem(item as any)) {
        const group = item as GroupNavItem;
        checkAndOpenGroup(key, group.children);
      }
    });
  }, [location, expandedGroups, setExpandedGroups, navItems]);
}