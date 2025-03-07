
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
RETURNS employee_sanctions_kpi AS $$
BEGIN
  RETURN (
    SELECT * 
    FROM employee_sanctions_kpi 
    WHERE store_id = store_id_param
  );
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
RETURNS employee_sanctions_report AS $$
BEGIN
  RETURN (
    SELECT * 
    FROM employee_sanctions_report 
    WHERE id = sanction_id_param
  );
END;
$$ LANGUAGE plpgsql;
