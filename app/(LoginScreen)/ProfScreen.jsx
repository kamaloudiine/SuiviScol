import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { supabase } from '../../supabaseClient';

export default function ProfScreen() {
  const [profId, setProfId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Référence pour la navigation entre champs
  const passwordRef = React.useRef(null);

  const handleLogin = async () => {
    setError('');
    // 1. Chercher l'email correspondant à l'identifiant dans la table profs
    const { data, error: fetchError } = await supabase
      .from('profs')
      .select('email, school_id')
      .eq('school_id', profId)
      .single();
    console.log('LOGIN profId:', profId);
    console.log('PROF FETCH RESULT:', data, fetchError);
    if (fetchError || !data) {
      setError("Identifiant professeur inconnu");
      return;
    }
    // 2. Connexion avec l'email trouvé et le mot de passe saisi
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: password,
    });
    if (loginError) {
      setError("Mot de passe incorrect");
      return;
    }
    // 3. Rediriger vers l'accueil prof (replace pour éviter le retour arrière)
    router.replace('/AccueilProf');
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
          {/* Header moderne avec thème professeur (orange) */}
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
            <Text style={styles.headerSubtitle}>Connexion Professeur</Text>
          </View>

          {/* Card principale de connexion */}
          <View style={styles.formContainer}>
            <Card style={styles.loginCard}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.userTypeIndicator}>
                  <Text style={styles.userTypeIcon}>👨‍🏫</Text>
                  <Text style={styles.userTypeTitle}>Espace Professeur</Text>
                  <Text style={styles.userTypeDescription}>
                    Gérez vos classes, notes et évaluations
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    label="Identifiant professeur"
                    value={profId}
                    onChangeText={setProfId}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                    keyboardType="default"
                    autoCapitalize="none"
                    theme={{ colors: { primary: '#FF9800' } }}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  
                  <TextInput
                    ref={passwordRef}
                    label="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    theme={{ colors: { primary: '#FF9800' } }}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>

                <Button 
                  mode="contained" 
                  onPress={handleLogin}
                  style={styles.loginButton}
                  icon="login"
                  buttonColor="#FF9800"
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
              Support technique disponible en cas de problème
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
    backgroundColor: '#FF9800', // Couleur professeur (orange)
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
    color: '#FF9800', // Cohérence couleur professeur
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
    shadowColor: '#FF9800',
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