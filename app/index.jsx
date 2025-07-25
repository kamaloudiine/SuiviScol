import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SuiviScol</Text>
      <Text style={styles.subtitle}>Je suis :</Text>
      <View style={styles.buttonGroup}>
        <Button 
          mode="text" 
          onPress={() => router.push('/ParentScreen')}
          style={styles.textButton}
          labelStyle={styles.buttonLabel}
        >
          Parent
        </Button>
        <Button 
          mode="text" 
          onPress={() => router.push('/StudentScreen')}
          style={styles.textButton}
          labelStyle={styles.buttonLabel}
        >
          Élève
        </Button>
        <Button 
          mode="text" 
          onPress={() => router.push('/ProfScreen')}
          style={styles.textButton}
          labelStyle={styles.buttonLabel}
        >
          Professeur
        </Button>
      </View>
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
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#3F51B5',
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 20,
  },
  textButton: {
    marginVertical: 8,
  },
  buttonLabel: {
    fontSize: 18,
    color: '#3F51B5',
  },
});