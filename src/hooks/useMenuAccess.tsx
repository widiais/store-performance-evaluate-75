
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as menuItemsConfig from "@/config/menuItems";

export const useMenuAccess = () => {
  const { user, userRole } = useAuth();
  const [accessibleMenus, setAccessibleMenus] = useState<string[]>([]);
  
  useEffect(() => {
    if (!user || !userRole) {
      setAccessibleMenus([]);
      return;
    }
    
    // For now, all menus are accessible
    // In future, this can be based on user role and permissions
    const allMenus = Object.keys(menuItemsConfig.default || {});
    setAccessibleMenus(allMenus);
  }, [user, userRole]);
  
  const hasAccess = (menuId: string) => {
    return accessibleMenus.includes(menuId);
  };
  
  return { hasAccess, accessibleMenus };
};

export default useMenuAccess;
