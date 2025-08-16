import { supabase } from '../supabaseClient';

/**
 * Crée un nouvel utilisateur dans la table users de Supabase
 * pour satisfaire la contrainte de clé étrangère
 * 
 * @param {string} email - L'email de l'utilisateur
 * @param {string} role - Le rôle de l'utilisateur (parent, student, professor)
 * @param {string} name - Le nom de l'utilisateur
 * @param {string} identifiant - L'identifiant de l'utilisateur (optionnel)
 * @returns {Promise<string|null>} - L'ID de l'utilisateur créé ou null en cas d'erreur
 */
export const createRealUser = async (email, role = 'parent', name = '', identifiant = null) => {
  try {
    // Vérifier d'abord si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser && existingUser.id) {
      console.log('Utilisateur existant trouvé:', existingUser.id);
      return existingUser.id;
    }
    
    // Générer un identifiant automatique s'il n'est pas fourni
    const userIdentifiant = identifiant || `${role}-${Math.floor(Math.random() * 10000)}`;
    
    // Sinon, créer un nouvel utilisateur
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: email,
        role: role,
        name: name,
        identifiant: userIdentifiant,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return null;
    }
    
    console.log('Nouvel utilisateur créé:', newUser.id);
    return newUser.id;
  } catch (error) {
    console.error('Exception lors de la création de l\'utilisateur:', error);
    return null;
  }
};
