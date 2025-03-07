
import { useAuth } from '@/contexts/AuthContext';

export const useMenuAccess = () => {
  const { isSuperAdmin } = useAuth();
  
  // Always return true for super admin status
  const isSuperAdmin = (): boolean => {
    return true;
  };
  
  // Always return true to allow access to all menu resources
  const canAccessMenu = (): boolean => {
    return true;
  };

  return { canAccessMenu, isSuperAdmin };
};
