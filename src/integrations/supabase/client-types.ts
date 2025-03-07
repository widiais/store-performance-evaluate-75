
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
