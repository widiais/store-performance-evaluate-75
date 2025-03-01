
import { useAuth } from "@/contexts/AuthContext";
import { SUPER_ADMIN_EMAIL } from "@/types/auth";

export const useMenuAccess = () => {
  const { user, hasPermission } = useAuth();

  const isSuperAdmin = (): boolean => {
    // Make sure we correctly compare with the super admin email, with more logging
    const userEmail = user?.profile?.email?.toLowerCase();
    const superAdminEmail = SUPER_ADMIN_EMAIL.toLowerCase();
    
    console.log('Checking super admin:', {
      userEmail,
      superAdminEmail,
      isMatch: userEmail === superAdminEmail
    });
    
    return userEmail === superAdminEmail;
  };

  const canAccessMenu = (resourceKey: string) => {
    if (!user) return false;
    if (isSuperAdmin()) return true;
    return hasPermission(resourceKey, 'read');
  };

  return { canAccessMenu, isSuperAdmin };
};
