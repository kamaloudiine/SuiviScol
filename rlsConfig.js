// Configuration RLS pour SuiviScol
import { supabase } from './supabaseClient';

export const initializeRLS = async () => {
  try {
    console.log('🔐 Initialisation des politiques RLS...');
    
    // Note: Ces commandes nécessitent des privilèges admin
    // À exécuter depuis le dashboard Supabase SQL Editor
    
    const rlsQueries = [
      // Activer RLS
      'ALTER TABLE profs ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE students ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE parents ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE notes ENABLE ROW LEVEL SECURITY;',
      
      // Politiques professeurs
      `CREATE POLICY "Professeurs peuvent gérer leurs données" ON profs
       FOR ALL USING (auth.uid() = user_id);`,
      
      // Politiques étudiants  
      `CREATE POLICY "Étudiants peuvent voir leurs données" ON students
       FOR SELECT USING (auth.uid() = user_id);`,
       
      // Politiques parents
      `CREATE POLICY "Parents peuvent voir leurs données" ON parents
       FOR SELECT USING (auth.uid() = user_id);`,
       
      // Politiques notes
      `CREATE POLICY "Professeurs peuvent gérer les notes" ON notes
       FOR ALL USING (
         auth.uid() IN (
           SELECT user_id FROM profs WHERE school_id = notes.prof_id
         )
       );`,
       
      `CREATE POLICY "Étudiants peuvent voir leurs notes" ON notes
       FOR SELECT USING (
         auth.uid() IN (
           SELECT user_id FROM students WHERE school_id = notes.student_id
         )
       );`
    ];
    
    console.log('⚠️  Ces requêtes doivent être exécutées depuis le Dashboard Supabase');
    console.log('📋 Copiez-collez dans SQL Editor:', rlsQueries.join('\n\n'));
    
    return { success: true, queries: rlsQueries };
    
  } catch (error) {
    console.error('❌ Erreur initialisation RLS:', error);
    return { success: false, error };
  }
};

// Fonction pour vérifier le statut RLS
export const checkRLSStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .eq('table_schema', 'public')
      .in('table_name', ['profs', 'students', 'parents', 'notes']);
    
    if (error) throw error;
    
    console.log('📊 Statut RLS:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Erreur vérification RLS:', error);
    return null;
  }
};
