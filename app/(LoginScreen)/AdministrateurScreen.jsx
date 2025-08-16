import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { supabase } from '../../supabaseClient';

export default function AdministrateurScreen() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Référence pour la navigation entre champs
  const passwordRef = React.useRef(null);

  const handleLogin = async () => {
    setError('');
    
    // Vérification des identifiants locaux d'abord
    if (adminId === 'admin' && password === 'admin!') {
      // Connexion avec le compte Supabase admin - utiliser le mot de passe saisi
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@suiviscol.com',
        password: password, // Utiliser le mot de passe saisi par l'utilisateur
      });
      
      if (loginError) {
        console.log('Erreur de connexion Supabase:', loginError);
        if (loginError.message.includes('Invalid login credentials')) {
          setError("Vérifiez que le compte admin@suiviscol.com existe dans Supabase avec le mot de passe 'admin!'");
        } else {
          setError("Erreur de connexion : " + loginError.message);
        }
        return;
      }
      
      // Rediriger vers l'accueil administrateur
      router.replace('/AccueilAdministrateur');
    } else {
      setError("Identifiant ou mot de passe administrateur incorrect");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header moderne avec thème administrateur (violet) */}
          <View style={styles.header}>
            <Button 
              mode="text" 
              onPress={() => router.back()}
              style={styles.backButton}
              labelStyle={styles.backButtonText}
              icon="arrow-left"
            >
              Retour
            </Button>
            <Text style={styles.headerTitle}>📚 SuiviScol</Text>
            <Text style={styles.headerSubtitle}>Connexion Administration</Text>
          </View>

          {/* Card principale de connexion */}
          <View style={styles.formContainer}>
            <Card style={styles.loginCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.userTypeIndicator}>
                  <Text style={styles.userTypeIcon}>⚙️</Text>
                  <Text style={styles.userTypeTitle}>Espace Administration</Text>
                  <Text style={styles.userTypeDescription}>
                    Gérez les utilisateurs et administrez le système
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Identifiant administrateur"
                    placeholder="admin"
                    value={adminId}
                    onChangeText={setAdminId}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="shield-account" />}
                    keyboardType="default"
                    autoCapitalize="none"
                    theme={{ colors: { primary: '#9C27B0' } }}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  
                  <TextInput
                    ref={passwordRef}
                    label="Mot de passe"
                    placeholder="admin!"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    theme={{ colors: { primary: '#9C27B0' } }}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>

                <Button 
                  mode="contained" 
                  onPress={handleLogin}
                  style={styles.loginButton}
                  icon="login"
                  buttonColor="#9C27B0"
                  textColor="white"
                >
                  Se connecter
                </Button>
                
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                ) : null}

                {/* Aide pour les développeurs */}
                <View style={styles.helpContainer}>
                  <Text style={styles.helpText}>
                    💡 Identifiants par défaut : admin / admin!
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* Footer discret */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Accès réservé aux administrateurs système
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#9C27B0', // Couleur administration (violet)
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 28,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: -30, // Overlap élégant
  },
  loginCard: {
    borderRadius: 20,
    elevation: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardContent: {
    padding: 25,
  },
  userTypeIndicator: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userTypeIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  userTypeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0', // Cohérence couleur administration
    marginBottom: 8,
  },
  userTypeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 25,
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  errorContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  helpContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  helpText: {
    color: '#1976d2',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
