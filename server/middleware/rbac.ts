import { Request, Response, NextFunction } from 'express';

// Define valid roles
const validRoles = ['admin', 'staff', 'manager', 'user'] as const;
type UserRole = typeof validRoles[number];

// Define role hierarchy
const roleHierarchy: Record<UserRole, UserRole[]> = {
  'admin': ['admin', 'staff', 'manager', 'user'],
  'staff': ['staff', 'manager', 'user'],
  'manager': ['manager', 'user'],
  'user': ['user']
};

/**
 * Helper function to check if a role is valid
 */
function isValidRole(role: string): role is UserRole {
  return validRoles.includes(role as UserRole);
}

/**
 * Middleware to check if a user has the required role
 * @param requiredRole - The role required to access the route
 * @returns Middleware function that checks user role
 */
export function requireRole(requiredRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user's role
    const userRole = req.user.role || 'user';
    
    // Ensure role is valid
    if (!isValidRole(userRole)) {
      return res.status(403).json({ message: 'Invalid user role' });
    }
    
    // Check if user's role has permission
    const allowedRoles = roleHierarchy[userRole];
    
    if (!allowedRoles.includes(requiredRole)) {
      return res.status(403).json({ 
        message: 'You do not have permission to access this resource' 
      });
    }
    
    // User has required role, proceed
    next();
  };
}

/**
 * Middleware to attach user permissions to the request object
 * Use this to dynamically determine available actions in the UI
 */
export function attachPermissions(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    const userRole = req.user.role || 'user';
    
    // Ensure role is valid
    if (!isValidRole(userRole)) {
      // Default to user permissions if role is invalid
      req.permissions = getDefaultPermissions();
      return next();
    }
    
    const allowedRoles = roleHierarchy[userRole];
    
    // Define permissions based on role
    req.permissions = {
      canManageUsers: allowedRoles.includes('admin'),
      canManageStaff: allowedRoles.includes('admin'),
      canViewAllLocations: allowedRoles.includes('admin') || allowedRoles.includes('staff'),
      canEditSettings: allowedRoles.includes('admin') || allowedRoles.includes('staff'),
      canDeleteReviews: allowedRoles.includes('admin'),
      canManageIntegrations: allowedRoles.includes('admin') || allowedRoles.includes('staff'),
      canViewReports: true, // All authenticated users can view reports
      canBulkEditReviews: allowedRoles.includes('admin') || allowedRoles.includes('staff'),
      isLocationManager: userRole === 'manager', // Specific for location managers
      canManageAssignedLocations: allowedRoles.includes('manager'),
    };
  }
  
  next();
}

/**
 * Helper function to get default permissions
 */
function getDefaultPermissions() {
  return {
    canManageUsers: false,
    canManageStaff: false,
    canViewAllLocations: false,
    canEditSettings: false,
    canDeleteReviews: false,
    canManageIntegrations: false,
    canViewReports: true, // All authenticated users can view reports
    canBulkEditReviews: false,
    isLocationManager: false,
    canManageAssignedLocations: false,
  };
}

/**
 * Helper function to check if a user has a specific permission
 */
export function hasPermission(user: Express.User | undefined, permission: string): boolean {
  if (!user) return false;
  
  const userRole = user.role || 'user';
  
  // Ensure role is valid
  if (!isValidRole(userRole)) {
    return false;
  }
  
  const allowedRoles = roleHierarchy[userRole];
  
  switch (permission) {
    case 'manageUsers':
      return allowedRoles.includes('admin');
    case 'manageStaff':
      return allowedRoles.includes('admin');
    case 'viewAllLocations':
      return allowedRoles.includes('admin') || allowedRoles.includes('staff');
    case 'editSettings':
      return allowedRoles.includes('admin') || allowedRoles.includes('staff');
    case 'deleteReviews':
      return allowedRoles.includes('admin');
    case 'manageIntegrations':
      return allowedRoles.includes('admin') || allowedRoles.includes('staff');
    case 'bulkEditReviews':
      return allowedRoles.includes('admin') || allowedRoles.includes('staff');
    case 'viewReports':
      return true; // All authenticated users
    default:
      return false;
  }
}

// Types for extending Express interfaces
declare global {
  namespace Express {
    interface Request {
      permissions?: {
        canManageUsers: boolean;
        canManageStaff: boolean;
        canViewAllLocations: boolean;
        canEditSettings: boolean;
        canDeleteReviews: boolean;
        canManageIntegrations: boolean;
        canViewReports: boolean;
        canBulkEditReviews: boolean;
        isLocationManager: boolean;
        canManageAssignedLocations: boolean;
      };
    }
  }
}