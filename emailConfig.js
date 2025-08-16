// Configuration pour contourner la validation email stricte
// À ajouter dans votre dashboard Supabase

/*
1. Dashboard Supabase → Authentication → Settings
2. Chercher "Email validation" ou "Email provider settings"
3. Options à modifier :

   - Disable email confirmations: ✅ (pour les emails fictifs)
   - Allow disposable email addresses: ✅
   - Custom SMTP: Configure avec un serveur qui accepte tous les domaines

4. Ou ajouter des domaines autorisés :
   - Allowed email domains: ecole.com, school.com, test.fr
*/

// Alternative : Validation côté client moins stricte
export const relaxedEmailValidation = (email) => {
  // Validation très permissive
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return basicEmailRegex.test(email);
};

// Fonction pour convertir un email "problématique" en email valide
export const makeEmailValid = (email) => {
  if (email.endsWith('@ecole.com')) {
    // Convertir vers un domaine accepté
    return email.replace('@ecole.com', '@gmail.com');
  }
  if (email.endsWith('@school.com')) {
    return email.replace('@school.com', '@test.fr');
  }
  return email;
};

// Configuration Supabase pour domaines personnalisés
export const supabaseEmailConfig = {
  // Dans le dashboard, section Authentication > Settings
  settings: {
    "enable_email_confirmations": false, // Désactive la confirmation par email
    "enable_signup": true,
    "allowed_email_domains": ["ecole.com", "school.com", "gmail.com", "test.fr"],
    "password_min_length": 6
  }
};
