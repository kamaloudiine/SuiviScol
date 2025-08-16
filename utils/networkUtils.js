// Utilitaires pour gérer les erreurs réseau et la connectivité dans SuiviScol

/**
 * Vérifie si une erreur est liée à un problème de réseau
 * @param {Error} error - L'erreur à vérifier
 * @returns {boolean} - True si c'est une erreur réseau
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  return (
    // Messages d'erreur communs liés au réseau
    (error.message && (
      error.message.includes('Network request failed') ||
      error.message.includes('network timeout') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network error') ||
      error.message.includes('ECONNABORTED')
    )) ||
    // Codes et noms d'erreur communs liés au réseau
    error.code === 'ECONNABORTED' ||
    error.name === 'AbortError' ||
    error.name === 'NetworkError' ||
    error.name === 'AuthRetryableFetchError' ||
    error.code === 'NETWORK_ERROR' ||
    // Certaines API spécifiques comme Supabase peuvent avoir des codes personnalisés
    error.code === 'PGRST301'
  );
};

/**
 * Génère un message d'erreur utilisateur approprié en fonction du type d'erreur
 * @param {Error} error - L'erreur survenue
 * @param {string} context - Contexte de l'opération (ex: "connexion", "chargement des données")
 * @returns {string} - Message d'erreur convivial pour l'utilisateur
 */
export const getUserFriendlyErrorMessage = (error, context = "l'opération") => {
  if (!error) return `Une erreur s'est produite lors de ${context}`;
  
  // Erreurs réseau
  if (isNetworkError(error)) {
    return "Problème de connexion internet. Vérifiez votre connexion et réessayez.";
  }
  
  // Erreurs d'authentification Supabase
  if (error.message?.includes('Invalid login credentials')) {
    return "Identifiant ou mot de passe incorrect";
  }
  
  if (error.message?.includes('already registered')) {
    return "Cet email est déjà enregistré dans le système";
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return "Votre email n'a pas encore été confirmé. Vérifiez votre boîte de réception.";
  }
  
  // Erreurs de base de données 
  if (error.message?.includes('violates foreign key constraint')) {
    return "Cette action est impossible car des données liées existent";
  }
  
  if (error.message?.includes('violates not-null constraint')) {
    return "Des informations obligatoires sont manquantes";
  }
  
  if (error.message?.includes('violates unique constraint')) {
    return "Un enregistrement avec ces informations existe déjà";
  }
  
  // Message par défaut
  return `Erreur lors de ${context}: ${error.message || 'Erreur inconnue'}`;
};

/**
 * Fonction de vérification de la connectivité réseau
 * @returns {Promise<boolean>} - True si la connexion est disponible
 */
export const checkNetworkConnectivity = async () => {
  try {
    // Tente de faire une requête simple pour vérifier la connectivité
    const response = await fetch('https://supabase.io/ping', { 
      method: 'HEAD',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    console.warn('Erreur de vérification de la connectivité:', error);
    return false;
  }
};
