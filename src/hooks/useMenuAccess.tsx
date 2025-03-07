
import { useAuth } from '@/contexts/AuthContext';

export const useMenuAccess = () => {
  const { isSuperAdmin: authIsSuperAdmin, hasPermission } = useAuth();
  
  // Check if user is super admin
  const isSuperAdmin = (): boolean => {
    return authIsSuperAdmin();
  };
  
  // Check if user can access a specific menu resource
  const canAccessMenu = (resourceKey: string): boolean => {
    // If no resource key is provided, allow access
    if (!resourceKey) return true;
    
    // Super admin can access all menus
    if (isSuperAdmin()) return true;
    
    // Check if user has read permission for the resource
    return hasPermission(resourceKey, 'read');
  };

  return { canAccessMenu, isSuperAdmin };
};
