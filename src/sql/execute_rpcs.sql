
-- Execute these functions to ensure they're available in the Supabase database
SELECT insert_esp_findings('[]'::jsonb);
SELECT get_esp_findings_by_evaluation_id(0);
SELECT get_employee_sanctions_kpi(1);
SELECT get_employee_sanctions_by_store(1);
SELECT get_employee_sanction_report(1);
