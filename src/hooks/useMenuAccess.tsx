
import { useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useMenuAccess = () => {
  const { user, permissions } = useAuth();

  const getMenuAccess = (resource: string) => {
    // If no user, no access
    if (!user) return false;
    
    // If no permissions array, no access
    if (!permissions || !Array.isArray(permissions)) return false;
    
    // Find the permission for the specified resource
    const permission = permissions.find(p => p.resource === resource);
    
    // If no permission found, no access
    if (!permission) return false;
    
    // User has access if they can at least read the resource
    return permission.can_read;
  };

  return { getMenuAccess };
};
