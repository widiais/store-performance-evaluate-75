
export const useMenuAccess = () => {
  // Always return true for all menu access since authentication is bypassed
  const isSuperAdmin = (): boolean => true;
  const canAccessMenu = (resourceKey: string) => true;

  return { canAccessMenu, isSuperAdmin };
};
