
// import { supabase } from '../../supabaseClient';

export default function ParentScreen() {
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    // Ici tu mettras la logique Supabase pour la connexion parent
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SuiviScol</Text>
      <Text style={styles.userTypeText}>Connexion Parent</Text>
      <TextInput
        label="Identifiant scolaire"
        value={schoolId}
        onChangeText={setSchoolId}
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
