
export interface Store {
  id: number;
  name: string;
  city: string;
  target_sales?: number;
  cogs_target?: number;
  opex_target?: number;
  total_crew?: number;
}

export interface EvaluationRecord {
  id: number;
  store_name: string;
  store_city?: string;
  evaluation_date: string;
  total_score: number;
  pic?: string;
  status?: string;
}

export interface FinancialRecord {
  id: number;
  store_name: string;
  store_city: string;
  input_date: string;
  total_sales: number;
  total_opex: number;
  cogs_achieved: number;
  target_sales: number;
  cogs_target: number;
  opex_target: number;
  total_crew: number;
}

export interface ComplaintRecord {
  id: number;
  store_name: string;
  input_date: string;
  whatsapp_count: number;
  social_media_count: number;
  gmaps_count: number;
  online_order_count: number;
  late_handling_count: number;
  total_weighted_complaints: number;
  avg_cu_per_day: number;
  kpi_score: number;
}

export interface SanctionKPI {
  store_id: number;
  store_name: string;
  store_city: string;
  total_employees: number;
  active_peringatan: number;
  active_sp1: number;
  active_sp2: number;
  kpi_score: number;
}

export interface ESPRecord {
  id: number;
  store_name: string;
  store_city: string;
  evaluation_date: string;
  total_score: number;
  final_score: number;
  kpi_score: number;
  pic: string;
  status: string;
  findings: string[];
}

export interface ChartDataPoint {
  date: string;
  [key: string]: number | string | null;
}

export interface EmployeeSanction {
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
}

export interface ActiveSanction {
  id: number;
  employee_name: string;
  sanction_date: string;
  sanction_type: string;
  duration_months: number;
  violation_details: string;
  pic: string;
  submitted_by: string;
  store_name: string;
  store_city: string;
}
