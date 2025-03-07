
-- Create a function to insert esp_findings records
CREATE OR REPLACE FUNCTION insert_esp_findings(findings_data JSONB)
RETURNS VOID AS $$
BEGIN
  INSERT INTO esp_findings (evaluation_id, finding, deduction_points)
  SELECT 
    (finding->>'evaluation_id')::integer,
    finding->>'finding',
    (finding->>'deduction_points')::integer
  FROM jsonb_array_elements(findings_data) AS finding;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get findings by evaluation_id
CREATE OR REPLACE FUNCTION get_esp_findings_by_evaluation_id(evaluation_id_param INTEGER)
RETURNS SETOF esp_findings AS $$
BEGIN
  RETURN QUERY 
  SELECT * 
  FROM esp_findings 
  WHERE evaluation_id = evaluation_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get employee sanctions KPI by store_id
CREATE OR REPLACE FUNCTION get_employee_sanctions_kpi(store_id_param INTEGER)
RETURNS TABLE (
  store_id INTEGER,
  store_name TEXT,
  store_city TEXT,
  total_employees INTEGER,
  active_peringatan INTEGER,
  active_sp1 INTEGER,
  active_sp2 INTEGER,
  kpi_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    esk.store_id,
    esk.store_name,
    esk.store_city,
    esk.total_employees,
    esk.active_peringatan,
    esk.active_sp1,
    esk.active_sp2,
    esk.kpi_score
  FROM employee_sanctions_kpi esk
  WHERE esk.store_id = store_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get employee sanctions by store_id
CREATE OR REPLACE FUNCTION get_employee_sanctions_by_store(store_id_param INTEGER)
RETURNS SETOF employee_sanctions AS $$
BEGIN
  RETURN QUERY 
  SELECT * 
  FROM employee_sanctions 
  WHERE store_id = store_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get employee sanctions report by id
CREATE OR REPLACE FUNCTION get_employee_sanction_report(sanction_id_param INTEGER)
RETURNS TABLE (
  id INTEGER,
  store_id INTEGER,
  employee_name TEXT,
  sanction_type TEXT,
  sanction_date DATE,
  duration_months INTEGER,
  expiry_date DATE,
  violation_details TEXT,
  submitted_by TEXT,
  is_active BOOLEAN,
  pic TEXT,
  store_name TEXT,
  store_city TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  input_date DATE,
  area INTEGER,
  regional INTEGER,
  total_crew INTEGER
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    es.id,
    es.store_id,
    es.employee_name,
    es.sanction_type,
    es.sanction_date,
    es.duration_months,
    es.expiry_date,
    es.violation_details,
    es.submitted_by,
    es.is_active,
    es.pic,
    s.name AS store_name,
    s.city AS store_city,
    es.created_at,
    es.updated_at,
    es.input_date,
    s.area,
    s.regional,
    s.total_crew
  FROM employee_sanctions es
  JOIN stores s ON es.store_id = s.id
  WHERE es.id = sanction_id_param;
END;
$$ LANGUAGE plpgsql;
