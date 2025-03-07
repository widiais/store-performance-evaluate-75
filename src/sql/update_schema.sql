
-- Create the esp_findings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.esp_findings (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES public.esp_evaluations(id) ON DELETE CASCADE,
  finding TEXT NOT NULL,
  deduction_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update timestamps
CREATE TRIGGER update_esp_findings_timestamp
BEFORE UPDATE ON public.esp_findings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create employee sanctions KPI view
CREATE OR REPLACE VIEW public.employee_sanctions_kpi AS
SELECT 
  s.id as store_id,
  s.name as store_name,
  s.city as store_city,
  s.total_crew as total_employees,
  COALESCE(COUNT(CASE WHEN es.sanction_type = 'Peringatan Tertulis' AND es.is_active = true THEN 1 END), 0) as active_peringatan,
  COALESCE(COUNT(CASE WHEN es.sanction_type = 'SP1' AND es.is_active = true THEN 1 END), 0) as active_sp1,
  COALESCE(COUNT(CASE WHEN es.sanction_type = 'SP2' AND es.is_active = true THEN 1 END), 0) as active_sp2,
  CASE 
    WHEN s.total_crew > 0 THEN
      LEAST(4, GREATEST(0, (1 - (
        (COALESCE(COUNT(CASE WHEN es.sanction_type = 'Peringatan Tertulis' AND es.is_active = true THEN 1 END), 0) * 1 +
         COALESCE(COUNT(CASE WHEN es.sanction_type = 'SP1' AND es.is_active = true THEN 1 END), 0) * 2 +
         COALESCE(COUNT(CASE WHEN es.sanction_type = 'SP2' AND es.is_active = true THEN 1 END), 0) * 3
        ) / s.total_crew)) * 4)
    ELSE 4
  END as kpi_score
FROM
  public.stores s
LEFT JOIN
  public.employee_sanctions es ON s.id = es.store_id AND es.is_active = true
GROUP BY
  s.id, s.name, s.city, s.total_crew;

-- Alter esp_evaluations to add kpi_score column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'esp_evaluations' AND column_name = 'kpi_score'
  ) THEN
    ALTER TABLE public.esp_evaluations 
    ADD COLUMN kpi_score INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update esp_evaluation_report view to include kpi_score
CREATE OR REPLACE VIEW public.esp_evaluation_report AS
SELECT 
  ee.id,
  s.name as store_name,
  s.city as store_city,
  ee.evaluation_date,
  ee.total_score,
  ee.final_score,
  ee.kpi_score,
  ee.pic,
  ee.status,
  ee.created_at,
  ee.updated_at,
  s.area,
  s.regional
FROM 
  public.esp_evaluations ee
JOIN 
  public.stores s ON ee.store_id = s.id;

-- Update the profiles table to add role_id if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN role_id UUID REFERENCES public.roles(id) NULL;
  END IF;
END $$;
