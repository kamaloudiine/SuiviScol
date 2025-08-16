-- Activer RLS pour toutes les tables
ALTER TABLE profs ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Créer des politiques de base pour permettre l'accès

-- Politique pour les professeurs : peuvent voir/modifier leurs propres données
CREATE POLICY "Professeurs peuvent gérer leurs données" ON profs
FOR ALL USING (auth.uid() = user_id);

-- Politique pour les étudiants : peuvent voir leurs propres données
CREATE POLICY "Étudiants peuvent voir leurs données" ON students
FOR SELECT USING (auth.uid() = user_id);

-- Politique pour les parents : peuvent voir leurs propres données
CREATE POLICY "Parents peuvent voir leurs données" ON parents
FOR SELECT USING (auth.uid() = user_id);

-- Politique pour les notes : les professeurs peuvent gérer leurs notes
CREATE POLICY "Professeurs peuvent gérer les notes" ON notes
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM profs WHERE school_id = notes.prof_id
  )
);

-- Politique pour les notes : les étudiants peuvent voir leurs notes
CREATE POLICY "Étudiants peuvent voir leurs notes" ON notes
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM students WHERE school_id = notes.student_id
  )
);

-- Politique administrative : permettre à l'admin de tout gérer
-- (Remplacez 'ADMIN_EMAIL' par votre email d'admin)
CREATE POLICY "Admin accès complet profs" ON profs
FOR ALL USING (
  auth.jwt() ->> 'email' = 'admin@suiviscol.com'
);

CREATE POLICY "Admin accès complet students" ON students
FOR ALL USING (
  auth.jwt() ->> 'email' = 'admin@suiviscol.com'
);

CREATE POLICY "Admin accès complet parents" ON parents
FOR ALL USING (
  auth.jwt() ->> 'email' = 'admin@suiviscol.com'
);

CREATE POLICY "Admin accès complet notes" ON notes
FOR ALL USING (
  auth.jwt() ->> 'email' = 'admin@suiviscol.com'
);
