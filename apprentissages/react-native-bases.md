# 📱 React Native - Les Bases Essentielles

## 🎯 **Qu'est-ce que React Native ?**

React Native est un **framework JavaScript** créé par Meta (Facebook) qui permet de développer des applications mobiles **natives** pour iOS et Android avec un seul code.

```javascript
// Tu écris du JavaScript...
<View>
  <Text>Hello World!</Text>
</View>

// ➡️ Devient du code natif iOS/Android
```

---

## 🔧 **Composants de Base**

### **Web vs Mobile**
| **React (Web)** | **React Native** | **Description** |
|-----------------|------------------|-----------------|
| `<div>` | `<View>` | Conteneur |
| `<p>`, `<span>` | `<Text>` | Texte |
| `<button>` | `<TouchableOpacity>` | Bouton cliquable |
| `<input>` | `<TextInput>` | Champ de saisie |
| `<img>` | `<Image>` | Image |

### **Exemples Pratiques**
```jsx
// Conteneur avec texte
<View style={styles.container}>
  <Text style={styles.title}>Mon App</Text>
</View>

// Bouton interactif
<TouchableOpacity onPress={() => alert('Coucou!')}>
  <Text>Appuie ici</Text>
</TouchableOpacity>

// Champ de saisie
<TextInput
  placeholder="Tapez ici..."
  value={text}
  onChangeText={setText}
/>
```

---

## 🎨 **Styles (StyleSheet)**

### **Syntaxe de base**
```jsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  }
});

// Utilisation
<View style={styles.container}>
  <Text style={styles.title}>Mon Titre</Text>
</View>
```

### **Propriétés Flexbox importantes**
```jsx
// Disposition
flexDirection: 'row', // horizontal
flexDirection: 'column', // vertical (défaut)

// Alignement
justifyContent: 'center', // axe principal
alignItems: 'center', // axe secondaire

// Taille
flex: 1, // prend tout l'espace disponible
```

---

## 📋 **Listes : FlatList vs .map()**

### **❌ Problème : FlatList dans ScrollView**
```jsx
// ❌ NE PAS FAIRE
<ScrollView>
  <FlatList data={items} /> // ERREUR !
</ScrollView>
```

### **✅ Solution 1 : Utiliser .map()**
```jsx
// ✅ CORRECT
<ScrollView>
  {items.map((item, index) => (
    <View key={index}>
      <Text>{item.name}</Text>
    </View>
  ))}
</ScrollView>
```

### **✅ Solution 2 : FlatList seule**
```jsx
// ✅ CORRECT pour longues listes
<FlatList
  data={items}
  renderItem={({ item }) => (
    <Text>{item.name}</Text>
  )}
  keyExtractor={item => item.id}
/>
```

### **Quand utiliser quoi ?**
- **`.map()`** : Listes courtes (< 100 éléments), dans ScrollView
- **`FlatList`** : Longues listes, performance optimisée

---

## ⚡ **État et Hooks**

### **useState - Gérer l'état**
```jsx
import { useState } from 'react';

function MonComposant() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <View>
      <Text>Compteur: {count}</Text>
      <TouchableOpacity onPress={() => setCount(count + 1)}>
        <Text>+1</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### **useEffect - Effets de bord**
```jsx
import { useEffect } from 'react';

useEffect(() => {
  // Code à exécuter au montage
  console.log('Composant monté');
  
  return () => {
    // Nettoyage au démontage
    console.log('Composant démonté');
  };
}, []); // [] = une seule fois

useEffect(() => {
  // Code à exécuter quand 'count' change
  console.log('Count a changé:', count);
}, [count]); // [count] = quand count change
```

---

## 🗄️ **Base de Données (Supabase)**

### **Configuration**
```jsx
import { supabase } from './supabaseClient';

// Récupérer des données
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('classe', 'Terminale');

// Insérer des données
const { error } = await supabase
  .from('notes')
  .insert({
    student_id: 123,
    subject: 'Maths',
    value: 15
  });

// Mettre à jour
const { error } = await supabase
  .from('absences')
  .update({ justified: true })
  .eq('id', absenceId);
```

---

## 🧭 **Navigation (Expo Router)**

### **Structure des dossiers**
```
app/
  index.jsx          // Page d'accueil
  profile.jsx        // Route /profile
  (auth)/           // Groupe de routes
    login.jsx       // Route /(auth)/login
    register.jsx    // Route /(auth)/register
```

### **Navigation de base**
```jsx
import { useRouter } from 'expo-router';

function MonComposant() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push('/profile')}>
      <Text>Aller au profil</Text>
    </TouchableOpacity>
  );
}

// Remplacer l'écran actuel (pas de retour possible)
router.replace('/home');

// Naviguer vers un écran
router.push('/details');

// Retour arrière
router.back();
```

---

## 🔒 **Sécurité Navigation**

### **Empêcher le retour vers login**
```jsx
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';

useEffect(() => {
  const backAction = () => {
    router.replace('/'); // Rediriger vers accueil
    return true; // Empêche le comportement par défaut
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  return () => backHandler.remove();
}, []);
```

---

## 📱 **Composants UI (React Native Paper)**

### **Installation et utilisation**
```jsx
import { Button, Card, FAB } from 'react-native-paper';

// Bouton Material Design
<Button mode="contained" onPress={handlePress}>
  Mon Bouton
</Button>

// Card avec contenu
<Card style={styles.card}>
  <Card.Content>
    <Text>Contenu de la card</Text>
  </Card.Content>
</Card>

// Floating Action Button
<FAB
  icon="plus"
  style={styles.fab}
  onPress={handleAdd}
/>
```

---

## 🐛 **Erreurs Communes et Solutions**

### **1. VirtualizedList Error**
```
❌ VirtualizedLists should never be nested inside plain ScrollViews
✅ Solution: Utiliser .map() au lieu de FlatList dans ScrollView
```

### **2. Key manquante**
```jsx
❌ {items.map(item => <Text>{item.name}</Text>)}
✅ {items.map((item, index) => <Text key={index}>{item.name}</Text>)}
```

### **3. Navigation infinie**
```jsx
❌ router.push('/login') // Ajoute à la pile
✅ router.replace('/login') // Remplace l'écran
```

---

## 🚀 **Commands Utiles**

```bash
# Démarrer le projet
npx expo start

# Nettoyer le cache
npx expo start --clear

# Installer des packages
npm install package-name

# Voir les logs
npx expo logs
```

---

## 💡 **Bonnes Pratiques**

1. **Toujours** utiliser `key` dans les listes
2. **Éviter** FlatList dans ScrollView
3. **Utiliser** router.replace() pour l'authentification
4. **Gérer** les états de chargement
5. **Nettoyer** les useEffect avec return
6. **Valider** les entrées utilisateur
7. **Tester** sur device réel

---

## 🎯 **Structure Type d'un Composant**

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MonComposant() {
  // 1. États
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Effets
  useEffect(() => {
    fetchData();
  }, []);

  // 3. Fonctions
  const fetchData = async () => {
    setLoading(true);
    // Logique ici
    setLoading(false);
  };

  // 4. Render conditionnel
  if (loading) {
    return <Text>Chargement...</Text>;
  }

  // 5. Render principal
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Composant</Text>
    </View>
  );
}

// 6. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

---

*📝 Créé le 6 août 2025 - Mis à jour lors du projet SuiviScol*
