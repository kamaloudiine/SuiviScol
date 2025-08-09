-- MISE À JOUR COMPLÈTE : Politiques RLS pour la justification d'absences
-- Permet aux élèves ET aux parents de justifier les absences

-- 1. Supprimer toutes les anciennes politiques pour les absences
DROP POLICY IF EXISTS "Students can view their own absences" ON absences;
DROP POLICY IF EXISTS "Students can justify their own absences" ON absences;
DROP POLICY IF EXISTS "Parents can view their children absences" ON absences;
DROP POLICY IF EXISTS "Parents can justify their children absences" ON absences;
DROP POLICY IF EXISTS "Profs can manage absences for their classes" ON absences;

-- 2. POLITIQUES POUR LES PROFESSEURS
-- Les professeurs peuvent tout faire (voir, créer, modifier) sur les absences de leurs élèves
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

-- 3. POLITIQUES POUR LES PARENTS
-- Les parents peuvent voir les absences de leurs enfants
CREATE POLICY "Parents can view their children absences" ON absences
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN parents p ON s.parent_email = p.email
      WHERE p.user_id = auth.uid()
    )
  );

-- Les parents peuvent justifier les absences de leurs enfants
CREATE POLICY "Parents can justify their children absences" ON absences
  FOR UPDATE
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN parents p ON s.parent_email = p.email
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM students s
      JOIN parents p ON s.parent_email = p.email
      WHERE p.user_id = auth.uid()
    )
  );

-- 4. POLITIQUES POUR LES ÉLÈVES
-- Les élèves peuvent voir leurs propres absences
CREATE POLICY "Students can view their own absences" ON absences
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students 
      WHERE user_id = auth.uid()
    )
  );

-- Les élèves peuvent justifier leurs propres absences
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

-- 5. VÉRIFICATION : Tester les politiques
-- Vous pouvez exécuter ces requêtes pour vérifier que tout fonctionne :

/*
-- Test pour un parent (remplacez par un vrai user_id de parent)
SELECT 'Test Parent - Absences visibles:' as info, COUNT(*) as count
FROM absences
WHERE student_id IN (
  SELECT s.id FROM students s
  JOIN parents p ON s.parent_email = p.email
  WHERE p.user_id = auth.uid()
);

-- Test pour un élève (remplacez par un vrai user_id d'élève)
SELECT 'Test Élève - Absences visibles:' as info, COUNT(*) as count
FROM absences
WHERE student_id IN (
  SELECT id FROM students 
  WHERE user_id = auth.uid()
);
*/

-- 6. PERMISSIONS FINALES
-- Vérifier que RLS est activé
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;

-- Afficher toutes les politiques créées
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'absences'
ORDER BY policyname;
