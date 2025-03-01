
export type PermissionType = 'create' | 'read' | 'update' | 'delete';

export interface Role {
  id: string;
  name: string;
  description?: string;
  role_level: 'admin' | 'manager' | 'supervisor' | 'staff';
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  role_id?: string;
  roles?: Role | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  montaz_id?: string;
  montaz_data?: any;
  montaz_password?: string;
  last_montaz_login?: string;
  assigned_stores?: string[];
  profile_completed?: boolean;
}

export interface User {
  id: string;
  email?: string;
  profile?: Profile;
  role?: Role;
  permissions?: RolePermission[];
}

export interface RolePermission {
  id: string;
  role_id: string;
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface MontazUser {
  id: string;
  email: string;
  montaz_id: string;
  montaz_data: any;
  profile_completed: boolean;
  is_active?: boolean;
  role_id?: string;
  assigned_stores?: string[];
  created_at?: string;
  updated_at?: string;
}

// Define super admin email constant for easy reference
export const SUPER_ADMIN_EMAIL = 'widi@admin.com';
