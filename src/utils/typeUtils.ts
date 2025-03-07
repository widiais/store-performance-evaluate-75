
import { EmployeeSanctionRecord, EmployeeSanctionsKPI } from "@/integrations/supabase/client-types";
import { ActiveSanction, SanctionKPI } from "@/components/store-performance/types";

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
    id: record.id,
    employee_name: record.employee_name || '',
    sanction_date: record.input_date || record.sanction_date || '',
    sanction_type: record.sanction_type || '',
    duration_months: record.duration_months || 0,
    violation_details: record.violation_details || '',
    pic: record.pic || '',
    submitted_by: record.submitted_by || '',
    store_name: record.store_name || '',
    store_city: record.store_city || ''
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
    store_name: record.store_name || '',
    store_city: record.store_city || '',
    created_at: record.created_at || '',
    updated_at: record.updated_at || '',
    input_date: record.input_date || record.sanction_date || '',
    area: record.area || 0,
    regional: record.regional || 0,
    total_crew: record.total_crew || 0
  };
}
