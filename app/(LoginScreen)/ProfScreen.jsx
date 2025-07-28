import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
// import { supabase } from '../../supabaseClient';

export default function ProfScreen() {
  const [profId, setProfId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    // Ici tu mettras la logique Supabase pour la connexion prof
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SuiviScol</Text>
      <Text style={styles.userTypeText}>Connexion Professeur</Text>
      <TextInput
        label="Identifiant professeur"
        value={profId}
        onChangeText={setProfId}
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="account" />}
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
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#3F51B5',
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 8,
  },
});