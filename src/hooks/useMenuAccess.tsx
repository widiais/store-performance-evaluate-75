
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { menuItems } from '@/config/menuItems';

export const useMenuAccess = () => {
  const { user } = useContext(AuthContext);
  
  const isSuperAdmin = !!user?.email?.includes('@admin');

  const hasAccess = (routePath: string) => {
    if (!user) return false;
    if (isSuperAdmin) return true;
    
    // Find menu item with matching path
    const flatMenuItems = menuItems.flatMap(item => 
      item.submenu ? [item, ...item.submenu] : [item]
    );
    
    const menuItem = flatMenuItems.find(item => item.path === routePath);
    
    // If menu item not found or no role restrictions, allow access
    if (!menuItem || !menuItem.roles || menuItem.roles.length === 0) return true;
    
    // Check if user's role matches any of the permitted roles
    return menuItem.roles.includes(user.role || '');
  };

  return {
    hasAccess,
    isSuperAdmin
  };
};

export default useMenuAccess;
