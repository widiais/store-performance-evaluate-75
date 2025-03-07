
import { EmployeeSanctionRecord, EmployeeSanctionsKPI, Profile, Role, RolePermission } from "@/integrations/supabase/client-types";
import { ActiveSanction, SanctionKPI } from "@/components/store-performance/types";
import { User } from "@/types/auth";

/**
 * Type assertion utility to safely cast database query results to specific types
 */
export function asType<T>(data: unknown): T {
  return data as T;
}

/**
 * Maps employee sanction records from the database to ActiveSanction type
 */
export function mapToActiveSanctions(records: any[]): ActiveSanction[] {
  return records.map(record => ({
    id: record.id || 0,
    employee_name: record.employee_name || '',
    sanction_date: record.input_date || record.sanction_date || '',
    sanction_type: record.sanction_type || (
      record.peringatan_count > 0 ? 'Peringatan Tertulis' :
      record.sp1_count > 0 ? 'SP1' :
      record.sp2_count > 0 ? 'SP2' : ''
    ),
    duration_months: record.duration_months || 0,
    violation_details: record.violation_details || '',
    pic: record.pic || '',
    submitted_by: record.submitted_by || '',
    store_name: record.stores?.name || record.store_name || '',
    store_city: record.stores?.city || record.store_city || '',
    is_active: record.is_active !== undefined ? record.is_active : 
               (record.status === 'active'),
    expiry_date: record.expiry_date || ''
  }));
}

/**
 * Maps employee sanctions KPI from the database to SanctionKPI type
 */
export function mapToSanctionKPI(data: any): SanctionKPI {
  return {
    store_id: data.store_id || 0,
    store_name: data.store_name || '',
    store_city: data.store_city || '',
    total_employees: data.total_employees || 0,
    active_peringatan: data.active_peringatan || 0,
    active_sp1: data.active_sp1 || 0,
    active_sp2: data.active_sp2 || 0,
    kpi_score: data.kpi_score || 0
  };
}

/**
 * Maps a database record to EmployeeSanctionRecord type
 */
export function mapToEmployeeSanctionRecord(record: any): EmployeeSanctionRecord {
  if (Array.isArray(record) && record.length > 0) {
    record = record[0]; // Take the first item if it's an array
  }
  
  return {
    id: record.id || 0,
    store_id: record.store_id || 0,
    employee_name: record.employee_name || '',
    sanction_type: record.sanction_type || '',
    sanction_date: record.sanction_date || record.input_date || '',
    duration_months: record.duration_months || 0,
    expiry_date: record.expiry_date || '',
    violation_details: record.violation_details || '',
    submitted_by: record.submitted_by || '',
    is_active: record.is_active || false,
    pic: record.pic || '',
    store_name: record.stores?.name || record.store_name || '',
    store_city: record.stores?.city || record.store_city || '',
    created_at: record.created_at || '',
    updated_at: record.updated_at || '',
    input_date: record.input_date || record.sanction_date || '',
    area: record.area || 0,
    regional: record.regional || 0,
    total_crew: record.total_crew || 0
  };
}

/**
 * Maps database records to EmployeeSanctionRecord array
 */
export function mapToEmployeeSanctionRecords(records: any[]): EmployeeSanctionRecord[] {
  return records.map(record => mapToEmployeeSanctionRecord(record));
}

/**
 * Maps a database record to Profile type
 */
export function mapToProfile(record: any): Profile {
  return {
    id: record.id || '',
    email: record.email || '',
    role_id: record.role_id || null,
    created_at: record.created_at || '',
    updated_at: record.updated_at || ''
  };
}

/**
 * Maps database record to Role type
 */
export function mapToRole(record: any): Role {
  return {
    id: record.id || '',
    name: record.name || '',
    description: record.description || '',
    role_level: record.role_level || 'staff',
    created_at: record.created_at || '',
    updated_at: record.updated_at || ''
  };
}

/**
 * Maps database record to RolePermission type
 */
export function mapToRolePermission(record: any): RolePermission {
  return {
    id: record.id || 0,
    role_id: record.role_id || '',
    resource: record.resource || '',
    can_create: record.can_create || false,
    can_read: record.can_read || false,
    can_update: record.can_update || false,
    can_delete: record.can_delete || false,
    created_at: record.created_at || '',
    updated_at: record.updated_at || ''
  };
}

/**
 * Maps database record to User type
 */
export function mapToUser(profile: any, role?: any): User {
  return {
    id: profile.id || '',
    email: profile.email || '',
    profile: mapToProfile(profile),
    role: role ? mapToRole(role) : undefined,
    permissions: []
  };
}
