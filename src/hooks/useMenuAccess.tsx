
import { useAuth } from "@/contexts/AuthContext";
import menuItems from "@/config/menuItems";
import { useState, useEffect } from "react";

export const useMenuAccess = () => {
  const { user, isSuperAdmin: checkSuperAdmin } = useAuth();
  const [visibleMenus, setVisibleMenus] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      // If super admin, show all menus
      if (checkSuperAdmin()) {
        setVisibleMenus(menuItems.map(item => item.id));
        return;
      }

      // Filter based on permissions
      // This is a placeholder - replace with actual permission logic
      const allowedMenus = menuItems
        .filter(item => {
          // Basic filtering logic based on role - expand as needed
          if (item.adminOnly) {
            return false;
          }
          return true;
        })
        .map(item => item.id);

      setVisibleMenus(allowedMenus);
    } else {
      // If not logged in, only show public menus
      setVisibleMenus(
        menuItems.filter(item => item.public).map(item => item.id)
      );
    }
  }, [user, checkSuperAdmin]);

  const hasAccess = (menuId: string) => {
    return visibleMenus.includes(menuId);
  };

  return { visibleMenus, hasAccess };
};

export default useMenuAccess;
