
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
// Prépare l'import Supabase (à activer après config)
// import { supabase } from '../../supabaseClient';



export default function StudentScreen() {
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // À remplacer par la logique Supabase
  const handleLogin = async () => {
    setError('');
    // Ici tu mettras la logique Supabase pour la connexion
    // Exemple :
    // 1. Chercher l'email correspondant à l'identifiant dans la table users
    // 2. Utiliser supabase.auth.signInWithPassword({ email, password })
    // 3. Rediriger si succès, afficher erreur sinon
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


// ...styles...

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

