import { 
  BarChart2, 
  Bell, 
  ChartPieIcon, 
  MessageSquare, 
  Settings, 
  Star, 
  Plug,
  Send,
  UsersRound,
  User,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  FileCog,
  Clock,
  Import,
  Workflow,
  Paintbrush,
  Code,
  Users,
  BadgeDollarSign,
  Package
} from "lucide-react";

// Base navigation item
export interface NavItemBase {
  icon: React.ComponentType<any>;
  label: string;
  tooltip?: string;
}

// Simple navigation item
export interface SimpleNavItem extends NavItemBase {
  type: 'item';
  href: string;
}

// Group navigation item with children
export interface GroupNavItem extends NavItemBase {
  type: 'group';
  children: SimpleNavItem[];
  expanded?: boolean;
}

// Separator item
export interface SeparatorItem {
  type: 'separator';
  label: string;
}

// Union type for all navigation item types
export type NavItem = SimpleNavItem | GroupNavItem | SeparatorItem;

// Role type
export type UserRole = 'admin' | 'staff' | 'user' | 'location_manager';

// Define common role-based permissions
export interface RolePermissions {
  canManageUsers: boolean;
  canManageStaff: boolean;
  canViewAllLocations: boolean;
  canEditSettings: boolean;
  canDeleteReviews: boolean;
  canManageIntegrations: boolean;
  canViewReports: boolean;
  canBulkEditReviews: boolean;
}

/**
 * Create the sidebar navigation structure
 * @param expandedGroups - Record of which groups are expanded
 * @returns Object containing navigation item groups
 */
export function createNavStructure(expandedGroups: Record<string, boolean>) {
  // Group: Dashboard & Main
  const mainNavItems: NavItem[] = [
    {
      type: 'item',
      icon: BarChart2,
      label: "Dashboard",
      href: "/",
      tooltip: "View your main dashboard"
    }
  ];
  
  // Group: Reviews & Feedback
  const reviewsNavItems: GroupNavItem = {
    type: 'group',
    icon: Star,
    label: "Reviews",
    tooltip: "Manage all your reviews",
    expanded: expandedGroups.reviews,
    children: [
      {
        type: 'item',
        icon: Star,
        label: "All Reviews",
        href: "/reviews",
        tooltip: "View all your reviews"
      },
      {
        type: 'item',
        icon: MessageSquare,
        label: "AI Responses",
        href: "/responses",
        tooltip: "AI-generated response suggestions"
      },
      {
        type: 'item',
        icon: Send,
        label: "Review Requests",
        href: "/review-requests",
        tooltip: "Manage review requests"
      }
    ]
  };
  
  // Group: Alerts & Notifications
  const alertsNavItem: NavItem = {
    type: 'item',
    icon: Bell,
    label: "Alerts",
    href: "/alerts",
    tooltip: "Review notifications and alerts"
  };
  
  // Group: Analytics & Reports
  const analyticsNavItems: GroupNavItem = {
    type: 'group',
    icon: ChartPieIcon,
    label: "Analytics",
    tooltip: "Performance insights and reports",
    expanded: expandedGroups.analytics,
    children: [
      {
        type: 'item',
        icon: ChartPieIcon,
        label: "Analytics",
        href: "/analytics",
        tooltip: "Detailed analytics and metrics"
      },
      {
        type: 'item',
        icon: FileText,
        label: "Reports",
        href: "/reports",
        tooltip: "Custom and scheduled reports"
      },
      {
        type: 'item',
        icon: UsersRound,
        label: "Competitors",
        href: "/competitors",
        tooltip: "Monitor competitor performance"
      },
      {
        type: 'item',
        icon: LayoutDashboard,
        label: "Dashboard Builder",
        href: "/dashboard-builder",
        tooltip: "Create custom dashboards"
      }
    ]
  };
  
  // Group: Management
  const managementNavItems: GroupNavItem = {
    type: 'group',
    icon: Settings,
    label: "Management",
    tooltip: "Manage platform operations",
    expanded: expandedGroups.management,
    children: [
      {
        type: 'item',
        icon: MessageSquare,
        label: "Communications",
        href: "/communications",
        tooltip: "Communication templates and history"
      },
      {
        type: 'item',
        icon: Import,
        label: "Import/Export",
        href: "/import-export",
        tooltip: "Import or export platform data"
      },
      {
        type: 'item',
        icon: Workflow,
        label: "Workflows",
        href: "/workflows",
        tooltip: "Automated workflow management"
      },
      {
        type: 'item',
        icon: Clock,
        label: "Activity Logs",
        href: "/activity-logs",
        tooltip: "User and system activity logs"
      },
      {
        type: 'item',
        icon: FileCog,
        label: "Templates",
        href: "/templates",
        tooltip: "Manage response templates"
      }
    ]
  };
  
  // Group: Configuration & Settings
  const configNavItems: GroupNavItem = {
    type: 'group',
    icon: Settings,
    label: "Configuration",
    tooltip: "Platform configuration",
    expanded: expandedGroups.config,
    children: [
      {
        type: 'item',
        icon: Code,
        label: "API Access",
        href: "/api-access",
        tooltip: "API keys and documentation"
      },
      {
        type: 'item',
        icon: Paintbrush,
        label: "White Label",
        href: "/white-label",
        tooltip: "White label settings"
      },
      {
        type: 'item',
        icon: Plug,
        label: "Integrations",
        href: "/integrations",
        tooltip: "Third-party integrations"
      },
      {
        type: 'item',
        icon: Settings,
        label: "Settings",
        href: "/settings",
        tooltip: "Platform settings"
      }
    ]
  };
  
  // Group: Account & Profile
  const accountNavItems: GroupNavItem = {
    type: 'group',
    icon: User,
    label: "Account",
    tooltip: "Manage your account",
    expanded: expandedGroups.account,
    children: [
      {
        type: 'item',
        icon: User,
        label: "Profile",
        href: "/profile",
        tooltip: "Your profile settings"
      },
      {
        type: 'item',
        icon: CreditCard,
        label: "Subscription",
        href: "/subscription",
        tooltip: "Manage your subscription"
      },
      {
        type: 'item',
        icon: HelpCircle,
        label: "Help & Support",
        href: "/help",
        tooltip: "Get help and support"
      }
    ]
  };
  
  // Client Admin navigation items (for business owners)
  const clientAdminNavItems: GroupNavItem = {
    type: 'group',
    icon: ShieldCheck,
    label: "Admin",
    tooltip: "Admin tools",
    expanded: expandedGroups.admin,
    children: [
      {
        type: 'item',
        icon: Users,
        label: "Users",
        href: "/client-admin/users",
        tooltip: "Manage users"
      },
      {
        type: 'item',
        icon: BadgeDollarSign,
        label: "Locations",
        href: "/client-admin/locations",
        tooltip: "Manage locations"
      }
    ]
  };

  // System Admin navigation items (for platform owner)
  const systemAdminNavItems: GroupNavItem = {
    type: 'group',
    icon: ShieldCheck,
    label: "System Admin",
    tooltip: "System administration tools",
    expanded: expandedGroups.systemAdmin,
    children: [
      {
        type: 'item',
        icon: Users,
        label: "Users",
        href: "/admin/users",
        tooltip: "Manage all users"
      },
      {
        type: 'item',
        icon: BadgeDollarSign,
        label: "Billing",
        href: "/admin/billing",
        tooltip: "Manage billing"
      },
      {
        type: 'item',
        icon: Package,
        label: "Subscriptions",
        href: "/admin/subscriptions",
        tooltip: "Manage subscriptions"
      }
    ]
  };
  
  // Create separator items
  const analyticsSeparator: SeparatorItem = { type: 'separator', label: 'Analytics' };
  const managementSeparator: SeparatorItem = { type: 'separator', label: 'Management' };
  const configSeparator: SeparatorItem = { type: 'separator', label: 'Configuration' };
  const accountSeparator: SeparatorItem = { type: 'separator', label: 'Account' };
  const adminSeparator: SeparatorItem = { type: 'separator', label: 'Administration' };
  
  return {
    mainNavItems,
    reviewsNavItems,
    alertsNavItem,
    analyticsNavItems,
    managementNavItems,
    configNavItems,
    accountNavItems,
    clientAdminNavItems,
    systemAdminNavItems,
    separators: {
      analyticsSeparator,
      managementSeparator,
      configSeparator,
      accountSeparator,
      adminSeparator
    }
  };
}

/**
 * Generate the complete sidebar navigation structure based on user role/permissions
 * @param expandedGroups - Record of expanded group state
 * @param permissions - User permissions object
 * @returns Complete navigation structure
 */
export function generateSidebarNavigation(
  expandedGroups: Record<string, boolean>,
  permissions?: RolePermissions | null
): NavItem[] {
  const {
    mainNavItems,
    reviewsNavItems,
    alertsNavItem,
    analyticsNavItems,
    managementNavItems,
    configNavItems,
    accountNavItems,
    clientAdminNavItems,
    systemAdminNavItems,
    separators
  } = createNavStructure(expandedGroups);
  
  // Base navigation items available to all users
  const baseNavItems: NavItem[] = [
    ...mainNavItems,
    reviewsNavItems,
    alertsNavItem,
    separators.analyticsSeparator,
    analyticsNavItems,
    separators.managementSeparator,
    managementNavItems,
    separators.configSeparator,
    configNavItems,
    separators.accountSeparator,
    accountNavItems,
  ];
  
  // Special handling for system admins vs client admins
  // System admins (platform owners with role="admin") can see system admin pages
  if (permissions?.canManageUsers && permissions?.canManageStaff && localStorage.getItem('userRole') === 'admin') {
    return [
      ...baseNavItems,
      separators.adminSeparator,
      systemAdminNavItems
    ];
  }
  
  // Client admins can only see client admin pages
  if (permissions?.canManageUsers) {
    return [
      ...baseNavItems,
      separators.adminSeparator,
      clientAdminNavItems
    ];
  }
  
  return baseNavItems;
}