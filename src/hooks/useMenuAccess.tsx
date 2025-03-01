
import { useAuth } from "@/contexts/AuthContext";
import { SUPER_ADMIN_EMAIL } from "@/types/auth";

export const useMenuAccess = () => {
  const { user, hasPermission } = useAuth();

  const isSuperAdmin = (): boolean => {
    return user?.profile?.email === SUPER_ADMIN_EMAIL;
  };

  const canAccessMenu = (resourceKey: string) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return hasPermission(resourceKey, 'read');
  };

  return { canAccessMenu, isSuperAdmin };
};
