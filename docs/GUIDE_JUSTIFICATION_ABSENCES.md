# Guide : Justification des Absences 📝

## ✅ Fonctionnalité Déjà Implémentée !

La fonctionnalité de justification d'absence par les parents existe déjà dans votre application SuiviScol.

## 🔧 Correction Effectuée

Le code parent a été corrigé pour rendre la justification fonctionnelle :
- ajout de l'`id` des absences dans la requête de récupération
- correction de la mise à jour des données après justification

## 👨‍👩‍👧‍👦 Interface Parent

### Accès aux absences
1. Connexion avec l'email du parent
2. Sélection d'un enfant via "Consulter"
3. Ouverture de l'onglet "🚫 Absences"

### Justification d'une absence
1. Identifier l'absence non justifiée
2. Cliquer sur le bouton "Justifier"
3. Saisir le motif
4. Valider

## 🛡️ Sécurité et Permissions

- Les parents voient et justifient uniquement les absences de leurs enfants
- Les élèves voient et justifient uniquement leurs propres absences
- Les professeurs gèrent les absences de leurs classes

## 🎯 Résumé

La fonctionnalité fonctionne et le petit bug de récupération des IDs a été corrigé.