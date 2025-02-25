
import { useAuth } from "@/contexts/AuthContext";

export const useMenuAccess = () => {
  const { user, hasPermission } = useAuth();

  const canAccessMenu = (resourceKey: string) => {
    if (!user) return false;
    return hasPermission(resourceKey, 'read');
  };

  return { canAccessMenu };
};
