import { useAuth } from "@/hooks/use-auth";

/**
 * Custom hook that provides enhanced user information and role-based utilities
 * 
 * @returns An object containing user information and role utility functions
 */
export function useUser() {
  const { user, permissions } = useAuth();
  
  // Check if user is a system admin (platform owner)
  const isSystemAdmin = user?.role === 'admin' && user?.username === 'admin';
  
  // Check if user is a client admin (business owner)
  const isClientAdmin = user?.role === 'admin' && !isSystemAdmin;
  
  // Check if user is staff
  const isStaff = user?.role === 'staff';
  
  // Check if user is a location manager
  const isLocationManager = user?.role === 'location_manager';
  
  // Check if user is a regular user
  const isRegularUser = user?.role === 'user';
  
  // Check if user has a specific permission
  const hasPermission = (permissionName: string): boolean => {
    if (!permissions) return false;
    return !!permissions[permissionName as keyof typeof permissions];
  };
  
  // Check if user can access admin pages
  const canAccessAdmin = isSystemAdmin || isClientAdmin;
  
  // Determine user type description for display
  const userTypeDescription = (): string => {
    if (isSystemAdmin) return 'System Administrator';
    if (isClientAdmin) return 'Administrator';
    if (isStaff) return 'Staff Member';
    if (isLocationManager) return 'Location Manager';
    return 'User';
  };
  
  return {
    user,
    permissions,
    isAdmin: user?.role === 'admin',
    isSystemAdmin,
    isClientAdmin,
    isStaff,
    isLocationManager,
    isRegularUser,
    hasPermission,
    canAccessAdmin,
    userTypeDescription,
  };
}

export default useUser;