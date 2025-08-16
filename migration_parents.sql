-- Migration SQL pour ajouter de nouveaux champs à la table parents
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Ajout du champ téléphone
ALTER TABLE IF EXISTS parents
ADD COLUMN IF NOT EXISTS telephone TEXT DEFAULT NULL;

-- 2. Ajout du champ adresse
ALTER TABLE IF EXISTS parents
ADD COLUMN IF NOT EXISTS adresse TEXT DEFAULT NULL;

-- 3. Ajout du champ profession
ALTER TABLE IF EXISTS parents
ADD COLUMN IF NOT EXISTS profession TEXT DEFAULT NULL;

-- 4. Ajout du champ relation
ALTER TABLE IF EXISTS parents
ADD COLUMN IF NOT EXISTS relation TEXT DEFAULT 'Parent';
