
import { useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MenuItem } from '@/types/menu';
import { menuItems } from '@/config/menuItems'; // Ensure this import is correct

export function useMenuAccess() {
  const { user, hasPermission } = useAuth();
  
  const getAccessibleMenus = (): MenuItem[] => {
    if (!user) return [];
    
    // Filter menu items based on permissions
    return menuItems.filter(menuItem => {
      // Check if user has read access to the menu resource
      return hasPermission(menuItem.resource, 'read');
    });
  };

  return {
    getAccessibleMenus,
  };
}
