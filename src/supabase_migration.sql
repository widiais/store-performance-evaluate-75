
-- Enable RLS but allow all operations for now (development mode)
ALTER TABLE champs_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE champs_evaluation_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE champs_questions ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations for all users (anonymous included)
CREATE POLICY "Allow all operations for all users" ON champs_evaluations
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations for all users" ON champs_evaluation_answers
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations for all users" ON champs_questions
FOR ALL
USING (true)
WITH CHECK (true);
