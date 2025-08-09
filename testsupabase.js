import { useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function TestSupabase() {
  useEffect(() => {
    const test = async () => {
      // 1. Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('USER:', user, 'ERROR:', userError);

      if (!user) return;

      // 2. Afficher l'id du parent
      console.log('PARENT ID:', user.id);

      // 3. Afficher tous les élèves et leur parent_id pour debug (avec détails)
      const { data: allStudents, error: allStudentsError } = await supabase
        .from('students')
        .select('id, nom, parent_id');
      if (allStudentsError) {
        console.log('Erreur lors de la récupération de tous les élèves:', allStudentsError);
      } else {
        console.log('TOUS LES ELEVES (id, nom, parent_id, typeof, length, hex):');
        allStudents.forEach(e => {
          const pid = e.parent_id;
          const pidType = typeof pid;
          const pidLen = pid ? pid.length : 0;
          const pidHex = pid ? Array.from(pid).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ') : '';
          console.log(`id: ${e.id}, nom: ${e.nom}, parent_id: '${pid}', type: ${pidType}, length: ${pidLen}, hex: ${pidHex}`);
        });
        // Afficher aussi l'id du parent connecté en détail
        const parentId = user.id;
        const parentIdType = typeof parentId;
        const parentIdLen = parentId.length;
        const parentIdHex = Array.from(parentId).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
        console.log(`PARENT CONNECTE id: '${parentId}', type: ${parentIdType}, length: ${parentIdLen}, hex: ${parentIdHex}`);
      }

      // 4. Chercher les élèves liés à ce parent
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', String(user.id).trim());
      console.log('STUDENTS TROUVES POUR CE PARENT:', students, 'ERROR:', studentsError);

      // 5. Pour chaque élève, afficher ses notes
      if (students && students.length > 0) {
        for (const student of students) {
          const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('student_id', student.id);
          console.log(`NOTES for student ${student.id} (${student.nom}):`, notes, 'ERROR:', notesError);
        }
      } else {
        console.log('Aucun élève trouvé pour ce parent.');
      }
    };
    test();
  }, []);

  return null;
}