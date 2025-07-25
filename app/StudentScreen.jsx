import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function StudentScreen() {
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleLogin = async () => {
  setError('');
  try {
    // Debug
    console.log("Recherche identifiant :", schoolId);
    const q = query(collection(db, "students"), where("identifiant", "==", schoolId));
    const querySnapshot = await getDocs(q);
    console.log("Résultat Firestore :", querySnapshot.docs.map(doc => doc.data()));

    if (querySnapshot.empty) {
      setError("Identifiant inconnu");
      return;
    }

    const email = querySnapshot.docs[0].data().email;

    // Connexion avec Firebase Auth
    await signInWithEmailAndPassword(auth, email, password);
    setError("Connexion réussie !");
    // Tu peux rediriger ou afficher le profil ici
  } catch (e) {
    setError(e.message);
  }
};
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SuiviScol</Text>
      <Text style={styles.userTypeText}>Connexion Élève</Text>
      <TextInput
        label="Identifiant scolaire"
        value={schoolId}
        onChangeText={setSchoolId}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="school" />}
        keyboardType="default"
        autoCapitalize="none"
      />
      <TextInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
        left={<TextInput.Icon icon="lock" />}
      />
      <Button 
        mode="contained" 
        onPress={handleLogin}
        style={styles.button}
        icon="login"
      >
        Se connecter
      </Button>
      {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
    </View>
  );
}

// ...styles inchangés...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#3F51B5',
    fontWeight: 'bold',
  },
  userTypeText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#555',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#3F51B5',
  },
});
