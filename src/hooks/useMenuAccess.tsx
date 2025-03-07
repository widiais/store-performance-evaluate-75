
import { useAuth } from '@/contexts/AuthContext';

export const useMenuAccess = () => {
  const { user, hasPermission } = useAuth();

  const getMenuAccess = (resource: string) => {
    // If no user, no access
    if (!user) return false;
    
    // Delegate to the hasPermission function from AuthContext
    return hasPermission(resource, 'read');
  };

  return { getMenuAccess };
};
