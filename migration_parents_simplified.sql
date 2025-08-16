-- Migration SQL pour ajouter uniquement le champ téléphone à la table parents
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajout du champ téléphone
ALTER TABLE IF EXISTS parents
ADD COLUMN IF NOT EXISTS telephone TEXT DEFAULT NULL;
