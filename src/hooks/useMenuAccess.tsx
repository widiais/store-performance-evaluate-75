
import { useAuth } from "@/contexts/AuthContext";

export const useMenuAccess = () => {
  const { user, hasPermission } = useAuth();

  const isSuperAdmin = (): boolean => {
    return user?.profile?.email === 'widi@admin.com';
  };

  const canAccessMenu = (resourceKey: string) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return hasPermission(resourceKey, 'read');
  };

  return { canAccessMenu, isSuperAdmin };
};
