# 🗄️ Configuration Base de Données - SuiviScol

> Guide complet pour configurer Supabase et les tables de l'application

## 📋 Prérequis

- Compte [Supabase](https://supabase.com)
- Accès au SQL Editor de Supabase
- Variables d'environnement configurées dans votre projet

## 🏗️ Architecture de la Base de Données

### **Tables Principales**

#### 1. **Table `students`** - Élèves
```sql
- id (UUID, Primary Key)
- nom (TEXT)
- prenom (TEXT) 
- classe (TEXT)
- user_id (UUID, Foreign Key vers auth.users)
- email (TEXT)
- parent_email (TEXT) -- Liaison avec les parents
```

#### 2. **Table `profs`** - Professeurs
```sql
- id (UUID, Primary Key)
- nom (TEXT)
- matiere (TEXT)
- classe (JSONB) -- Support multi-classes
- user_id (UUID, Foreign Key vers auth.users)
- email (TEXT)
```

#### 3. **Table `parents`** - Parents
```sql
- id (UUID, Primary Key)
- nom (TEXT)
- email (TEXT)
- user_id (UUID, Foreign Key vers auth.users)
```

#### 4. **Table `notes`** - Notes Scolaires
```sql
- id (UUID, Primary Key)
- student_id (UUID, Foreign Key vers students)
- subject (TEXT)
- value (DECIMAL)
- date (DATE)
- comment (TEXT)
- evaluation (TEXT) -- Type d'évaluation
- coefficient (DECIMAL) -- Pondération
- prof_id (UUID, Foreign Key vers profs)
```

#### 5. **Table `absences`** - Gestion des Absences
```sql
- id (UUID, Primary Key)
- student_id (UUID, Foreign Key vers students)
- date (DATE)
- subject (TEXT)
- prof_id (UUID, Foreign Key vers profs)
- justified (BOOLEAN) -- Statut de justification
- reason (TEXT) -- Motif de justification
- created_at (TIMESTAMP)
```

## 🔒 Politiques RLS (Row Level Security)

### **Sécurité par Rôle Utilisateur**

#### **Professeurs** 🎓
- **Accès complet** aux notes et absences de leurs classes
- **Création/Modification** des notes et absences
- **Gestion multi-classes** avec support JSONB

#### **Parents** 👨‍👩‍👧‍👦
- **Lecture seule** des notes et absences de leurs enfants
- **Justification** des absences de leurs enfants
- **Accès multi-enfants** via liaison email

#### **Élèves** 🎓
- **Lecture seule** de leurs propres notes et absences
- **Justification** de leurs propres absences
- **Accès personnel** uniquement

### **Exemple de Politique RLS**
```sql
-- Professeurs peuvent gérer les absences de leurs classes
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
        (jsonb_typeof(p.classe) = 'array' 
         AND s.classe = ANY(SELECT jsonb_array_elements_text(p.classe)))
      )
    )
  );
```

## 🚀 Instructions de Configuration

### **Étape 1 : Créer le Projet Supabase**
1. Aller sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé API

### **Étape 2 : Configuration des Variables**
Ajouter dans votre fichier `.env` :
```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_api_anonyme
```

### **Étape 3 : Exécuter les Scripts SQL**
1. Aller dans **SQL Editor** de votre dashboard Supabase
2. Exécuter les scripts dans cet ordre :
   - Création des tables
   - Configuration des politiques RLS
   - Insertion des données de test (optionnel)

### **Étape 4 : Tester la Connexion**
```javascript
// Test de connexion dans votre app
import { supabase } from './supabaseClient';

const testConnection = async () => {
  const { data, error } = await supabase.from('students').select('count');
  console.log('Connexion:', error ? 'Échec' : 'Réussie');
};
```

## 🔧 Maintenance et Monitoring

### **Requêtes Utiles**
```sql
-- Vérifier les politiques RLS
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('students', 'profs', 'parents', 'notes', 'absences');

-- Statistiques d'utilisation
SELECT 
  'Élèves' as type, COUNT(*) as total FROM students
UNION ALL
SELECT 
  'Professeurs' as type, COUNT(*) as total FROM profs
UNION ALL
SELECT 
  'Parents' as type, COUNT(*) as total FROM parents;
```

### **Performance**
- **Index** sur les colonnes fréquemment utilisées
- **Pagination** pour les grandes listes
- **Cache** avec Supabase Realtime si nécessaire

## 🚨 Sécurité

### **Bonnes Pratiques**
- ✅ Toujours utiliser RLS sur toutes les tables
- ✅ Tester les politiques avec différents utilisateurs
- ✅ Limiter les permissions au strict nécessaire
- ✅ Auditer régulièrement les accès

### **Points d'Attention**
- 🔍 Vérifier les relations parent-enfant via email
- 🔍 Contrôler les accès multi-classes des professeurs
- 🔍 Valider les données avant insertion

## 📞 Support

En cas de problème avec la configuration :
1. Vérifier les logs Supabase
2. Tester les politiques RLS individuellement  
3. Consulter la documentation Supabase
4. Contacter le support technique

---

📝 **Ce document est mis à jour régulièrement. Dernière modification : Août 2025**