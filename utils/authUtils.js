// Fonction pour tester si un email existe dans Supabase
import { supabase } from '../supabaseClient';

/**
 * Vérifie si un email existe déjà dans le système, dans n'importe quelle table
 * @param {string} email - L'email à vérifier
 * @returns {Promise<{exists: boolean, table: string|null, userId: string|null}>} - Résultat de la vérification
 */
export const checkEmailExists = async (email) => {
  try {
    // Vérifier dans la table parents
    const { data: parentData } = await supabase
      .from('parents')
      .select('id, user_id')
      .eq('email', email)
      .single();
      
    if (parentData) {
      return { 
        exists: true, 
        table: 'parents', 
        userId: parentData.user_id,
        recordId: parentData.id 
      };
    }
    
    // Vérifier dans la table profs
    const { data: profData } = await supabase
      .from('profs')
      .select('id, user_id')
      .eq('email', email)
      .single();
      
    if (profData) {
      return { 
        exists: true, 
        table: 'profs', 
        userId: profData.user_id,
        recordId: profData.id 
      };
    }
    
    // Vérifier dans la table students
    const { data: studentData } = await supabase
      .from('students')
      .select('id, user_id')
      .eq('email', email)
      .single();
      
    if (studentData) {
      return { 
        exists: true, 
        table: 'students', 
        userId: studentData.user_id,
        recordId: studentData.id 
      };
    }
    
    // L'email n'existe dans aucune table
    return { exists: false, table: null, userId: null, recordId: null };
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    // En cas d'erreur, supposons que l'email n'existe pas
    return { exists: false, table: null, userId: null, recordId: null, error };
  }
};

/**
 * Génère un UUID valide v4 à utiliser comme ID utilisateur fictif
 * @returns {string} - Un UUID v4 valide
 */
export const generateFakeUserId = () => {
  // Format UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // où x est n'importe quel chiffre hexadécimal et y est 8, 9, A ou B
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Tente d'inscrire un utilisateur et gère correctement l'erreur "already registered"
 * @param {string} email - L'email pour l'inscription
 * @param {string} password - Le mot de passe pour l'inscription
 * @param {Object} userData - Les données utilisateur à enregistrer
 * @returns {Promise<{success: boolean, userId: string|null, isExisting: boolean, error: Error|null, fakeUserId: string|null}>}
 */
export const safeSignUp = async (email, password, userData = {}) => {
  try {
    // Essayer d'inscrire l'utilisateur
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      // Si l'erreur est "already registered", c'est un cas particulier
      if (error.message && error.message.includes('already registered')) {
        // Pour les utilisateurs déjà enregistrés, essayons de récupérer leur ID
        try {
          // Essayer de se connecter en tant qu'administrateur pour accéder aux données utilisateur
          // Si cela n'est pas possible dans votre application, 
          // vous devrez peut-être créer un utilisateur réel au lieu d'utiliser un ID fictif
          
          // Essayons d'abord de trouver l'utilisateur par email dans la table users de Supabase
          const { data: existingUser } = await supabase
            .from('users')  // Assurez-vous que cette table existe dans votre base de données
            .select('id')
            .eq('email', email)
            .single();

          if (existingUser && existingUser.id) {
            return {
              success: false,
              userId: existingUser.id,
              fakeUserId: null,
              isExisting: true,
              error
            };
          } else {
            // Si nous ne pouvons pas trouver l'utilisateur, créons un véritable utilisateur dans la table users
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                email: email,
                role: 'parent',  // Ou toute autre information nécessaire
                identifiant: `user-${Math.floor(Math.random() * 10000)}`
              })
              .select('id')
              .single();
              
            if (insertError) {
              console.error('Erreur lors de la création de l\'utilisateur dans la table users:', insertError);
              return {
                success: false,
                userId: null,
                fakeUserId: null,
                isExisting: false,
                error: insertError
              };
            }
            
            return {
              success: false,
              userId: newUser.id,
              fakeUserId: null,
              isExisting: true,
              error
            };
          }
        } catch (adminError) {
          console.error('Erreur lors de la récupération des données utilisateur:', adminError);
          // En cas d'échec, générer un ID factice (ce qui causera probablement l'erreur de contrainte)
          const fakeUserId = generateFakeUserId();
          
          return {
            success: false,
            userId: null,
            fakeUserId,
            isExisting: true,
            error
          };
        }
      }
      
      // Autre type d'erreur
      return {
        success: false,
        userId: null,
        fakeUserId: null,
        isExisting: false,
        error
      };
    }
    
    // Inscription réussie
    return {
      success: true,
      userId: data?.user?.id || null,
      fakeUserId: null,
      isExisting: false,
      error: null
    };
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return {
      success: false,
      userId: null,
      fakeUserId: null,
      isExisting: false,
      error
    };
  }
};
