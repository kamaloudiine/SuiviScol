import { StyleSheet, View } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';

export default function ProfScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SuiviScol</Text>
      <Text style={styles.userTypeText}>Connexion Professeur</Text>
      <TextInput
        label="Identifiant professeur"
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="account" />}
        keyboardType="default"
        autoCapitalize="none"
      />
      <TextInput
        label="Mot de passe"
        mode="outlined"
        secureTextEntry
        style={styles.input}
        left={<TextInput.Icon icon="lock" />}
      />
      <Button 
        mode="contained" 
        style={styles.button}
        icon="login"
      >
        Se connecter
      </Button>
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