-- Supprime la contrainte de clé étrangère sur students.user_id (et parents.user_id si besoin)
ALTER TABLE students DROP CONSTRAINT IF EXISTS fk_user_student;
ALTER TABLE parents DROP CONSTRAINT IF EXISTS fk_user_parent;
