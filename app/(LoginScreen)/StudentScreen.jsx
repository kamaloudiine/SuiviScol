
import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { supabase } from '../../supabaseClient';
import ConnectionStatus from '../../utils/ConnectionStatus';
import { isNetworkError, getUserFriendlyErrorMessage } from '../../utils/networkUtils';



export default function StudentScreen() {
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const router = useRouter();
  
  // Référence pour la navigation entre champs
  const passwordRef = React.useRef(null);

  const handleLogin = async () => {
    setError('');
    try {
      // 1. Chercher l'email correspondant au school_id dans la table students
      const { data, error: fetchError } = await supabase
        .from('students')
        .select('email')
        .eq('school_id', schoolId)
        .single();
      
      if (fetchError) {
        console.error('Erreur recherche identifiant:', fetchError);
        if (fetchError.message && fetchError.message.includes('Network request failed')) {
          setError("Problème de connexion internet. Vérifiez votre connexion et réessayez.");
          return;
        } else {
          setError("Identifiant scolaire inconnu");
          return;
        }
      }
      
      if (!data) {
        setError("Identifiant scolaire inconnu");
        return;
      }
      
      // 2. Connexion avec l'email trouvé et le mot de passe saisi
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: password,
      });
      
      if (loginError) {
        console.error('Erreur de connexion:', loginError);
        if (loginError.message && loginError.message.includes('Network request failed')) {
          setError("Problème de connexion internet. Vérifiez votre connexion et réessayez.");
        } else if (loginError.message && loginError.message.includes('Invalid login credentials')) {
          setError("Mot de passe incorrect");
        } else {
          setError("Erreur de connexion: " + loginError.message);
        }
        return;
      }
      
      // 3. Rediriger vers l'accueil élève (replace pour éviter le retour arrière)
      router.replace('/AccueilEleve');
    } catch (error) {
      console.error('Erreur de connexion Supabase:', error);
      setError("Problème de connexion. Vérifiez votre connexion internet et réessayez.");
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
          {/* Header moderne avec thème élève (bleu) */}
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
            <Text style={styles.headerSubtitle}>Connexion Élève</Text>
          </View>

          {/* Card principale de connexion */}
          <View style={styles.formContainer}>
            <Card style={styles.loginCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.userTypeIndicator}>
                  <Text style={styles.userTypeIcon}>🎓</Text>
                  <Text style={styles.userTypeTitle}>Espace Élève</Text>
                  <Text style={styles.userTypeDescription}>
                    Consultez vos notes et gérez vos absences
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Identifiant scolaire"
                    placeholder="Ex: 2024001"
                    value={schoolId}
                    onChangeText={setSchoolId}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="school" color="#1A73E8" />}
                    keyboardType="default"
                    autoCapitalize="none"
                    theme={{ 
                      colors: { 
                        primary: '#1A73E8',
                        placeholder: '#9AA0A6',
                        text: '#202124'
                      } 
                    }}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                    outlineStyle={{ borderRadius: 12 }}
                  />
                  
                  <TextInput
                    ref={passwordRef}
                    label="Mot de passe"
                    placeholder="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" color="#1A73E8" />}
                    theme={{ 
                      colors: { 
                        primary: '#1A73E8',
                        placeholder: '#9AA0A6',
                        text: '#202124'
                      }
                    }}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    outlineStyle={{ borderRadius: 12 }}
                  />
                </View>

                <Button 
                  mode="contained" 
                  onPress={handleLogin}
                  style={styles.loginButton}
                  icon="login"
                  buttonColor="#2196F3"
                  textColor="white"
                >
                  Se connecter
                </Button>
                
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                ) : null}
              </Card.Content>
            </Card>
          </View>

          {/* Footer discret */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Questions sur vos notes ? Contactez vos professeurs
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}


// ...styles...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: '#1A73E8',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 32,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -40,
  },
  loginCard: {
    borderRadius: 24,
    elevation: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardContent: {
    padding: 28,
  },
  userTypeIndicator: {
    alignItems: 'center',
    marginBottom: 35,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF6',
  },
  userTypeIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  userTypeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A73E8',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  userTypeDescription: {
    fontSize: 15,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.25,
  },
  inputContainer: {
    marginBottom: 28,
  },
  input: {
    marginBottom: 18,
    backgroundColor: 'white',
    fontSize: 16,
  },
  loginButton: {
    borderRadius: 14,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginTop: 8,
  },
  errorContainer: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.25,
  },
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});

