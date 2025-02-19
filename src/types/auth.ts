
export type PermissionType = 'create' | 'read' | 'update' | 'delete';

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  resource: string;
  permission: PermissionType;
}

export interface Profile {
  id: string;
  email: string;
  role_id?: string;
}

export interface User {
  id: string;
  email?: string;
  profile?: Profile;
  role?: Role;
  permissions?: RolePermission[];
}
