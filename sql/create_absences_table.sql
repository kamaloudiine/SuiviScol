-- Création de la table absences
CREATE TABLE IF NOT EXISTS absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  subject TEXT NOT NULL,
  prof_id UUID REFERENCES profs(id),
  justified BOOLEAN DEFAULT false,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_absences_student_date ON absences(student_id, date);
CREATE INDEX IF NOT EXISTS idx_absences_date ON absences(date);

-- RLS (Row Level Security)
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

-- Politique pour les professeurs (peuvent voir et modifier les absences de leurs élèves)
CREATE POLICY "Profs can manage absences for their classes" ON absences
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profs p, students s
      WHERE p.user_id = auth.uid()
      AND s.id = absences.student_id
      AND (
        (p.classe::text = s.classe) OR
        (jsonb_typeof(p.classe) = 'array' AND s.classe = ANY(SELECT jsonb_array_elements_text(p.classe))) OR
        (jsonb_typeof(p.classe) = 'string' AND s.classe = ANY(string_to_array(p.classe::text, ',')))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profs p, students s
      WHERE p.user_id = auth.uid()
      AND s.id = absences.student_id
      AND (
        (p.classe::text = s.classe) OR
        (jsonb_typeof(p.classe) = 'array' AND s.classe = ANY(SELECT jsonb_array_elements_text(p.classe))) OR
        (jsonb_typeof(p.classe) = 'string' AND s.classe = ANY(string_to_array(p.classe::text, ',')))
      )
    )
  );

-- Politique pour les parents (peuvent voir les absences de leurs enfants)
CREATE POLICY "Parents can view their children absences" ON absences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents pa, students s
      WHERE pa.user_id = auth.uid()
      AND s.id = absences.student_id
      AND s.parent_email = pa.email
    )
  );

-- Politique pour les élèves (peuvent voir leurs propres absences)
CREATE POLICY "Students can view their own absences" ON absences
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students 
      WHERE user_id = auth.uid()
    )
  );

-- Politique pour permettre aux élèves de justifier leurs absences
CREATE POLICY "Students can justify their own absences" ON absences
  FOR UPDATE
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students 
      WHERE user_id = auth.uid()
    )
  );
