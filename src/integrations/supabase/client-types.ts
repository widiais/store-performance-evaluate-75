
// This file adds explicit type definitions for Supabase tables and views that
// are not automatically generated in the types.ts file

// Define custom types for tables not in the auto-generated types
export interface EspFinding {
  id: number;
  evaluation_id: number;
  finding: string;
  deduction_points: number;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeSanctionsKPI {
  store_id: number;
  store_name: string;
  store_city: string;
  total_employees: number;
  active_peringatan: number;
  active_sp1: number;
  active_sp2: number;
  kpi_score: number;
}

export interface EmployeeSanctionRecord {
  id: number;
  store_id: number;
  employee_name: string;
  sanction_type: string;
  sanction_date: string;
  duration_months: number;
  expiry_date: string;
  violation_details: string;
  submitted_by: string;
  is_active: boolean;
  pic: string;
  store_name: string;
  store_city: string;
  created_at?: string;
  updated_at?: string;
  input_date?: string;
  area?: number;
  regional?: number;
  total_crew?: number;
}

// Define profiles table type which is missing from auto-generated types
export interface Profile {
  id: string;
  email: string;
  role_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Define roles table type which is missing from auto-generated types
export interface Role {
  id: string;
  name: string;
  description?: string;
  role_level: 'admin' | 'manager' | 'supervisor' | 'staff';
  created_at?: string;
  updated_at?: string;
}

export interface RolePermission {
  id: number;
  role_id: string;
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoleWithPermissions extends Role {
  permissions?: RolePermission[];
}

// Function response types
export type FunctionResponse<T> = T | null;
