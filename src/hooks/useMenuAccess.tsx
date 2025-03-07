
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { menuItems } from '@/config/menuItems';

export const useMenuAccess = () => {
  const { user, userRole } = useContext(AuthContext);
  
  const isSuperAdmin = userRole === 'admin';

  // Check if a user has access to a specific menu item
  const hasAccess = (menuPath: string) => {
    if (!user) return false;
    
    if (isSuperAdmin) return true;
    
    // Find the menu item by path
    const menuItem = findMenuItemByPath(menuPath, menuItems);
    
    // If menu item not found or doesn't have roles defined, deny access
    if (!menuItem || !menuItem.roles) return false;
    
    // Check if user's role is included in the menu item's allowed roles
    return menuItem.roles.includes(userRole || '');
  };
  
  // Helper function to find a menu item by its path
  const findMenuItemByPath = (path: string, items: any[]): any => {
    for (const item of items) {
      if (item.path === path) return item;
      
      if (item.children) {
        const found = findMenuItemByPath(path, item.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return { hasAccess, isSuperAdmin };
};
