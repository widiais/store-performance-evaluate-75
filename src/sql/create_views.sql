
-- Create view for CHAMPS evaluation report
CREATE OR REPLACE VIEW public.champs_evaluation_report AS
SELECT 
  ce.id,
  s.name as store_name,
  s.city as store_city,
  ce.evaluation_date,
  ce.pic,
  ce.total_score,
  ce.status,
  s.regional,
  s.area,
  ce.created_at,
  ce.updated_at
FROM 
  public.champs_evaluations ce
JOIN 
  public.stores s ON ce.store_id = s.id
ORDER BY 
  ce.evaluation_date DESC;

-- Ensure the employee_sanctions table tracks sanction details
ALTER TABLE public.employee_sanctions 
ADD COLUMN IF NOT EXISTS employee_name TEXT,
ADD COLUMN IF NOT EXISTS sanction_type TEXT,
ADD COLUMN IF NOT EXISTS duration_months INTEGER,
ADD COLUMN IF NOT EXISTS violation_details TEXT,
ADD COLUMN IF NOT EXISTS submitted_by TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create or update employee_sanctions_kpi view
CREATE OR REPLACE VIEW public.employee_sanctions_kpi AS
SELECT 
  s.id as store_id,
  s.name as store_name,
  s.city as store_city,
  s.total_crew as total_employees,
  COUNT(CASE WHEN es.sanction_type = 'Peringatan Tertulis' AND es.is_active = TRUE THEN 1 END) as active_peringatan,
  COUNT(CASE WHEN es.sanction_type = 'SP1' AND es.is_active = TRUE THEN 1 END) as active_sp1,
  COUNT(CASE WHEN es.sanction_type = 'SP2' AND es.is_active = TRUE THEN 1 END) as active_sp2,
  CASE 
    WHEN s.total_crew > 0 THEN 
      ROUND(
        (1 - (
          (COUNT(CASE WHEN es.sanction_type = 'Peringatan Tertulis' AND es.is_active = TRUE THEN 1 END) * 1 +
           COUNT(CASE WHEN es.sanction_type = 'SP1' AND es.is_active = TRUE THEN 1 END) * 2 +
           COUNT(CASE WHEN es.sanction_type = 'SP2' AND es.is_active = TRUE THEN 1 END) * 3
          ) / s.total_crew
        ) * 4, 
        2
      )
    ELSE 4
  END as kpi_score
FROM 
  public.stores s
LEFT JOIN 
  public.employee_sanctions es ON s.id = es.store_id
GROUP BY 
  s.id, s.name, s.city, s.total_crew;

-- Create esp_findings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.esp_findings (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER REFERENCES public.esp_evaluations(id) ON DELETE CASCADE,
  finding TEXT NOT NULL,
  deduction_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
