# Guide : Justification des Absences 📝

## ✅ Fonctionnalité Déjà Implémentée !

La fonctionnalité de justification d'absence par les parents **existe déjà** dans votre application SuiviScol. Voici comment l'utiliser :

## 🔧 Correction Effectuée

J'ai corrigé un petit bug dans le code parent qui empêchait la justification de fonctionner correctement :
- Ajout de l'`id` des absences dans la requête de récupération
- Correction de la mise à jour des données après justification

## 👨‍👩‍👧‍👦 Interface Parent

### Accès aux absences :
1. **Connexion** : Le parent se connecte avec son email
2. **Sélection enfant** : Clic sur "Consulter" pour un enfant
3. **Onglet Absences** : Basculer vers l'onglet "🚫 Absences"

### Justification d'une absence :
1. **Identifier l'absence** : Les absences non justifiées apparaissent avec un badge rouge "Non justifiée"
2. **Bouton Justifier** : Clic sur le bouton orange "Justifier"
3. **Saisie du motif** : Remplir le champ de justification (ex: "Maladie", "Rendez-vous médical")
4. **Validation** : Clic sur "Justifier" pour envoyer

### Statuts des absences :
- 🔴 **Non justifiée** : Badge rouge + bouton "Justifier" disponible
- 🟢 **Justifiée** : Badge vert + motif affiché

## 🎓 Interface Élève

Les élèves peuvent également justifier leurs propres absences :
1. **Onglet Absences** : Dans l'interface élève
2. **Bouton Justifier** : Sur les absences non justifiées
3. **Même processus** : Saisie du motif et validation

## 🏫 Interface Professeur

Les professeurs peuvent :
- **Créer des absences** : Marquer un élève absent
- **Voir les justifications** : Consulter les motifs fournis par élèves/parents

## 🛡️ Sécurité et Permissions

### Politiques de base de données :
- ✅ **Parents** : Peuvent voir et justifier les absences de leurs enfants uniquement
- ✅ **Élèves** : Peuvent voir et justifier leurs propres absences uniquement  
- ✅ **Professeurs** : Peuvent gérer toutes les absences de leurs classes

### Protection des données :
- Chaque utilisateur ne voit que les données qui le concernent
- Les justifications sont liées au compte authentifié
- Impossible de justifier l'absence d'un autre enfant

## 📱 Utilisation Pratique

### Exemple de workflow parent :
1. **Notification** : "Votre enfant était absent en Mathématiques le 07/08/2025"
2. **Connexion** : Se connecter sur l'app SuiviScol
3. **Navigation** : Enfant → Consulter → Onglet Absences
4. **Justification** : Cliquer "Justifier" → Saisir "Rendez-vous dentiste" → Valider
5. **Confirmation** : Message "L'absence a été justifiée avec succès"

### Motifs de justification courants :
- 🏥 **Maladie** : "Grippe avec certificat médical"
- 🦷 **Rendez-vous médical** : "Rendez-vous chez le dentiste"
- 👨‍👩‍👧 **Problème familial** : "Événement familial urgent"
- 🚗 **Transport** : "Problème de transport scolaire"
- 🏫 **Sortie éducative** : "Participation à une sortie scolaire"

## 🔄 Synchronisation

- Les justifications sont **immédiatement** visibles par tous (parent, élève, professeur)
- Les données sont synchronisées en temps réel via Supabase
- L'historique complet des justifications est conservé

## ⚠️ Points Importants

1. **Une seule justification** : Une fois justifiée, l'absence ne peut plus être modifiée
2. **Motif obligatoire** : Impossible de justifier sans fournir un motif
3. **Historique** : Toutes les justifications sont horodatées et traçées
4. **Permissions strictes** : Seuls les parents et l'élève concerné peuvent justifier

---

## 🎯 Résumé

**La fonctionnalité fonctionne parfaitement !** Les parents peuvent justifier les absences de leurs enfants en toute sécurité. Le petit bug de récupération des IDs a été corrigé, et le système est maintenant 100% opérationnel.
