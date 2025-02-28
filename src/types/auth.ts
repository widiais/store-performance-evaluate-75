
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
