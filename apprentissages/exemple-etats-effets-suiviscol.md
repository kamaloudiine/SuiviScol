# 🎯 **États vs Effets - Exemple Concret SuiviScol**

## 📱 **Exemple Réel : AccueilEleve.jsx**

Voici comment **états** et **effets** travaillent ensemble dans ton app :

```jsx
export default function AccueilEleve() {
  // 🏠 ÉTATS = "Mémoire" du composant
  const [student, setStudent] = useState(null);           // Qui est connecté ?
  const [notes, setNotes] = useState([]);                // Ses notes ?
  const [absences, setAbsences] = useState([]);          // Ses absences ?
  const [loading, setLoading] = useState(true);          // Chargement en cours ?
  const [activeTab, setActiveTab] = useState('notes');   // Onglet actif ?

  // ⚡ EFFET 1 : Au démarrage de l'app
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);  // 📊 CHANGEMENT D'ÉTAT
      
      // Récupérer l'élève connecté
      const { data: { user } } = await supabase.auth.getUser();
      const { data: studentData } = await supabase
        .from('students')
        .select('nom, classe, id, user_id')
        .eq('user_id', user.id)
        .single();
      
      setStudent(studentData);  // 📊 CHANGEMENT D'ÉTAT
      
      if (studentData) {
        // Récupérer ses notes
        const { data: notesData } = await supabase
          .from('notes')
          .select('subject, value, date, comment')
          .eq('student_id', studentData.id);
        
        setNotes(notesData || []);  // 📊 CHANGEMENT D'ÉTAT
        
        // Récupérer ses absences
        const { data: absencesData } = await supabase
          .from('absences')
          .select('id, date, subject, justified, reason')
          .eq('student_id', studentData.id);
        
        setAbsences(absencesData || []);  // 📊 CHANGEMENT D'ÉTAT
      }
      
      setLoading(false);  // 📊 CHANGEMENT D'ÉTAT
    };
    
    fetchData();  // 🚀 EXÉCUTER L'ACTION
  }, []); // ⚡ DÉCLENCHEUR : Une seule fois au démarrage

  // ⚡ EFFET 2 : Sécurité navigation
  useEffect(() => {
    const backAction = () => {
      router.replace('/');  // Empêcher retour vers login
      return true;
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();  // 🧹 NETTOYAGE
  }, [router]); // ⚡ DÉCLENCHEUR : Si router change

  // 🎨 RENDU basé sur les ÉTATS
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Chargement...</Text>  {/* État 'loading' = true */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec nom de l'élève */}
      <Text style={styles.headerTitle}>Mon Espace Élève</Text>
      <Text style={styles.headerSubtitle}>
        {student ? `${student.nom} - Classe ${student.classe}` : 'Chargement...'}
        {/* ↑ Affichage basé sur l'état 'student' */}
      </Text>

      {/* Onglets basés sur l'état 'activeTab' */}
      <TouchableOpacity onPress={() => setActiveTab('notes')}>
        <Text>📚 Mes Notes ({notes.length})</Text>
        {/* ↑ Affichage basé sur l'état 'notes' */}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setActiveTab('absences')}>
        <Text>🚫 Mes Absences ({absences.length})</Text>
        {/* ↑ Affichage basé sur l'état 'absences' */}
      </TouchableOpacity>

      {/* Contenu basé sur l'état 'activeTab' */}
      {activeTab === 'notes' ? (
        <View>
          {notes.map((note, index) => (
            <Card key={index}>
              <Text>{note.subject}: {note.value}/20</Text>
            </Card>
          ))}
        </View>
      ) : (
        <View>
          {absences.map((absence, index) => (
            <Card key={index}>
              <Text>{absence.subject} - {absence.justified ? 'Justifiée' : 'Non justifiée'}</Text>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}
```

---

## 🔄 **Le Cycle Complet**

### **1. 🚀 Démarrage de l'app**
```
useEffect(() => { ... }, [])  ⚡ SE DÉCLENCHE
↓
setLoading(true)             📊 ÉTAT CHANGE
↓
Interface affiche "Chargement..."  🎨 RE-RENDER
↓
Requêtes Supabase           🗄️ DATA FETCH
↓
setStudent(data)            📊 ÉTAT CHANGE
setNotes(data)              📊 ÉTAT CHANGE  
setAbsences(data)           📊 ÉTAT CHANGE
setLoading(false)           📊 ÉTAT CHANGE
↓
Interface affiche les données    🎨 RE-RENDER
```

### **2. 👆 Utilisateur clique sur onglet**
```
onPress={() => setActiveTab('absences')}  👆 ACTION
↓
setActiveTab('absences')                   📊 ÉTAT CHANGE
↓
Interface change d'onglet                  🎨 RE-RENDER
```

---

## 💡 **Points Clés de cet Exemple**

### **📊 ÉTATS utilisés :**
- `student` → Stocke les infos de l'élève connecté
- `notes` → Stocke la liste des notes
- `absences` → Stocke la liste des absences  
- `loading` → Indique si on charge les données
- `activeTab` → Indique quel onglet est affiché

### **⚡ EFFETS utilisés :**
- **Au montage** → Charger les données depuis Supabase
- **Navigation** → Empêcher le retour vers login
- **Nettoyage** → Supprimer l'écouteur BackHandler

### **🎨 RENDU conditionnel :**
- Si `loading` = true → Afficher spinner
- Sinon → Afficher l'interface
- Si `activeTab` = 'notes' → Afficher les notes
- Sinon → Afficher les absences

---

## 🎯 **En Résumé Simple**

Dans SuiviScol :
- **ÉTATS** = Ce que l'app "se rappelle" (qui est connecté, ses notes, etc.)
- **EFFETS** = Ce que l'app "fait" quand quelque chose change (charger données, sécuriser navigation)

**💡 Chaque fois qu'un état change → React redessine l'interface !**

---

*📚 Exemple tiré du projet SuiviScol - AccueilEleve.jsx*
