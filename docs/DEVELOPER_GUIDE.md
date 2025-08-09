# 🛠️ Guide Développeur - SuiviScol

> Documentation technique pour les développeurs travaillant sur SuiviScol

## 🏗️ Architecture Générale

### **Stack Technologique**
- **Frontend** : React Native + Expo
- **Backend** : Supabase (PostgreSQL + Auth + Realtime)
- **Navigation** : Expo Router
- **État Local** : React Hooks (useState, useEffect)
- **Styling** : StyleSheet (React Native)

### **Structure des Données**
```
auth.users (Supabase Auth)
    ↓
├── profs (Professeurs)
├── parents (Parents)  
└── students (Élèves)
    ↓
├── notes (Notes scolaires)
└── absences (Gestion absences)
```

## 📁 Structure du Code

```
SuiviScol/
├── app/                          # Pages principales
│   ├── index.jsx                # Page connexion/accueil
│   ├── AccueilProf.jsx          # Interface professeur
│   ├── AccueilParent.jsx        # Interface parent
│   └── AccueilEleve.jsx         # Interface élève
├── assets/                       # Ressources statiques
├── docs/                        # Documentation
├── supabaseClient.js            # Configuration Supabase
├── app.config.js                # Configuration Expo
└── package.json                 # Dépendances
```

## 🔧 Configuration de Développement

### **Prérequis**
```bash
# Node.js et npm
node --version  # v18+
npm --version   # v8+

# Expo CLI
npm install -g @expo/cli

# Simulateurs (optionnel)
# iOS: Xcode + iOS Simulator
# Android: Android Studio + Emulator
```

### **Installation Locale**
```bash
# Cloner et installer
git clone <repo-url>
cd SuiviScol
npm install

# Variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer en développement
npm start
```

### **Configuration Supabase**
```javascript
// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Gestion état app pour auth
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
```

## 📱 Composants Principaux

### **Page de Connexion** (`app/index.jsx`)
```javascript
// Fonctionnalités clés
- Authentification email/password
- Redirection basée sur le rôle utilisateur
- Gestion d'erreurs de connexion
- Interface responsive

// Structure
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  // 1. Authentification Supabase
  // 2. Détection du rôle (prof/parent/élève)
  // 3. Redirection vers l'interface appropriée
};
```

### **Interface Professeur** (`app/AccueilProf.jsx`)
```javascript
// Fonctionnalités
- Gestion multi-classes (JSONB)
- Attribution de notes avec commentaires auto
- Marquage d'absences avec prévention doublons
- Interface modale pour les actions

// États principaux
const [selectedStudent, setSelectedStudent] = useState(null);
const [noteModalVisible, setNoteModalVisible] = useState(false);
const [absenceModalVisible, setAbsenceModalVisible] = useState(false);
const [students, setStudents] = useState([]);

// Logique métier
const generateComment = (note) => {
  if (note >= 18) return "Excellent travail ! Continue ainsi.";
  if (note >= 16) return "Très bien, bon niveau maintenu.";
  if (note >= 14) return "Bien, des progrès sont visibles.";
  if (note >= 12) return "Assez bien, peut encore s'améliorer.";
  if (note >= 10) return "Passable, efforts à intensifier.";
  return "Insuffisant, il faut redoubler d'efforts.";
};
```

### **Interface Parent** (`app/AccueilParent.jsx`)
```javascript
// Fonctionnalités
- Multi-enfants avec liaison email
- Navigation par onglets (Notes/Absences)
- Justification d'absences avec modal
- Mise à jour temps réel

// Structure des onglets
const [activeTab, setActiveTab] = useState('notes');
const [justificationModalVisible, setJustificationModalVisible] = useState(false);

// Justification d'absence
const submitJustification = async () => {
  const { error } = await supabase
    .from('absences')
    .update({
      justified: true,
      reason: justificationReason.trim()
    })
    .eq('id', selectedAbsence.id);
};
```

### **Interface Élève** (`app/AccueilEleve.jsx`)
```javascript
// Fonctionnalités modernes
- Interface tabulée responsive
- Auto-justification d'absences
- Consultation notes personnelles
- Design moderne avec feedback

// Navigation onglets
const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity 
    style={[styles.tabButton, isActive && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);
```

## 🗄️ Gestion des Données

### **Requêtes Supabase Typiques**

#### **Récupération avec RLS**
```javascript
// Notes d'un élève (vue élève)
const { data: notes } = await supabase
  .from('notes')
  .select('subject, value, date, comment, evaluation, coefficient')
  .eq('student_id', studentId)
  .order('date', { ascending: false });

// Absences avec justifications (vue parent)
const { data: absences } = await supabase
  .from('absences')
  .select('id, date, subject, justified, reason, created_at')
  .eq('student_id', childId)
  .order('date', { ascending: false });
```

#### **Insertion avec Validation**
```javascript
// Nouvelle note avec prévention doublons
const { data: existing } = await supabase
  .from('notes')
  .select('id')
  .eq('student_id', studentId)
  .eq('subject', subject)
  .eq('date', date)
  .eq('evaluation', evaluation);

if (existing.length === 0) {
  const { error } = await supabase
    .from('notes')
    .insert({
      student_id: studentId,
      subject,
      value: parseFloat(note),
      date,
      comment: generateComment(parseFloat(note)),
      evaluation,
      coefficient: parseFloat(coefficient),
      prof_id: profId
    });
}
```

#### **Mise à jour avec Politique RLS**
```javascript
// Justification d'absence (parent ou élève)
const { error } = await supabase
  .from('absences')
  .update({
    justified: true,
    reason: motif
  })
  .eq('id', absenceId);
```

## 🔒 Sécurité et RLS

### **Politiques par Rôle**

#### **Détection du Rôle Utilisateur**
```javascript
const getUserRole = async (userId) => {
  // Vérifier dans l'ordre : prof -> parent -> élève
  const { data: prof } = await supabase
    .from('profs')
    .select('id')
    .eq('user_id', userId)
    .single();
  
  if (prof) return 'prof';
  
  const { data: parent } = await supabase
    .from('parents')
    .select('id')
    .eq('user_id', userId)
    .single();
    
  if (parent) return 'parent';
  
  return 'student';
};
```

#### **Gestion Multi-Classes (Professeurs)**
```sql
-- Politique RLS pour support JSONB
USING (
  EXISTS (
    SELECT 1 FROM profs p, students s
    WHERE p.user_id = auth.uid()
    AND s.id = notes.student_id
    AND (
      (p.classe::text = s.classe) OR
      (jsonb_typeof(p.classe) = 'array' 
       AND s.classe = ANY(SELECT jsonb_array_elements_text(p.classe))) OR
      (jsonb_typeof(p.classe) = 'string' 
       AND s.classe = ANY(string_to_array(p.classe::text, ',')))
    )
  )
)
```

## 🎨 Styling et UX

### **Thème Cohérent**
```javascript
const styles = StyleSheet.create({
  // Couleurs principales
  primaryColor: '#3F51B5',      // Bleu principal
  successColor: '#4CAF50',      // Vert (justifié)
  warningColor: '#FF9800',      // Orange (action)
  errorColor: '#FF5722',        // Rouge (non justifié)
  
  // Layouts responsive
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  
  // Composants modernes
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  
  activeTab: {
    backgroundColor: '#3F51B5',
  }
});
```

### **Composants Réutilisables**
```javascript
// Modal standardisé
const StandardModal = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        {children}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Bouton d'action cohérent
const ActionButton = ({ title, onPress, style, disabled }) => (
  <TouchableOpacity 
    style={[styles.actionButton, style, disabled && styles.disabledButton]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.actionButtonText}>{title}</Text>
  </TouchableOpacity>
);
```

## 🧪 Tests et Debugging

### **Tests de Fonctionnalités**
```javascript
// Test de connexion
const testAuth = async () => {
  const { user, error } = await supabase.auth.signIn({
    email: 'test@example.com',
    password: 'password123'
  });
  console.log('Auth test:', error ? 'Failed' : 'Success');
};

// Test RLS policies
const testRLS = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*');
  console.log('RLS test:', data.length, 'visible records');
};
```

### **Debugging Commun**
```javascript
// Logs détaillés pour développement
console.log('USER:', user);
console.log('STUDENT:', studentData);
console.log('NOTES:', notesData);

// Gestion d'erreurs Supabase
if (error) {
  console.log('Supabase Error:', error.message);
  console.log('Error Details:', error.details);
  console.log('Error Code:', error.code);
}
```

## 🚀 Déploiement

### **Build de Production**
```bash
# Android
expo build:android

# iOS  
expo build:ios

# Web
expo export:web
```

### **Variables d'Environnement**
```javascript
// app.config.js
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
};
```

## 📈 Optimisations

### **Performance**
- Pagination pour les grandes listes
- Mise en cache des données fréquentes
- Lazy loading des images
- Optimisation des requêtes Supabase

### **UX**
- Loading states partout
- Feedback immédiat des actions
- Gestion d'erreurs user-friendly
- Navigation intuitive

---

🔧 **Cette documentation évolue avec le projet. Contributions bienvenues !**
