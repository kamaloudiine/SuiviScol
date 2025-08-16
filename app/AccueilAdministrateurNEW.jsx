import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../supabaseClient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AccueilAdministrateur() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    subject: '',
    classe: '',
    school_id: '',
    parent_email: ''
  });
  const [lastGeneratedPassword, setLastGeneratedPassword] = useState('');
  const [lastUserInfo, setLastUserInfo] = useState(null);

  // States pour stocker les listes d'utilisateurs
  const [profs, setProfs] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);

  // Charger les utilisateurs au chargement de la page
  useEffect(() => {
    loadUsers();
    // Actualisation toutes les 60 secondes
    const interval = setInterval(() => {
      loadUsers();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Total d'utilisateurs
  const totalUsers = profs.length + students.length + parents.length;

  // Charger les données depuis Supabase
  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data: profsData } = await supabase.from('profs').select('*').order('nom');
      const { data: studentsData } = await supabase.from('students').select('*').order('nom');
      const { data: parentsData } = await supabase.from('parents').select('*').order('nom');
      setProfs(profsData || []);
      setStudents(studentsData || []);
      setParents(parentsData || []);
    } catch (err) {
      setFeedback('Erreur lors du chargement des utilisateurs');
    }
    setLoading(false);
  };

  // Fonction de suppression d'utilisateur
  const handleDeleteUser = async (type, id, nom) => {
    Alert.alert(
      'Confirmation',
      `Voulez-vous vraiment supprimer ${nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase.from(type).delete().eq('id', id);
              if (error) {
                setFeedback('Erreur lors de la suppression');
              } else {
                setFeedback(`✅ ${nom} a été supprimé`);
                loadUsers();
              }
            } catch (err) {
              setFeedback('Erreur inattendue');
            }
            setLoading(false);
            setTimeout(() => setFeedback(''), 3000);
          }
        }
      ]
    );
  };

  // Génère un mot de passe simple
  const generatePassword = () => {
    const length = 8;
    const charset = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  // Valider le format de l'email
  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  };

  // Convertir les emails problématiques
  const convertToValidEmail = (email) => {
    const domainsToConvert = ['@ecole.com'];
    const validDomain = '@gmail.com';
    
    for (const domain of domainsToConvert) {
      if (email.endsWith(domain)) {
        return email.replace(domain, validDomain);
      }
    }
    
    return email;
  };

  // Générer un fichier texte avec les identifiants
  const generateCredentialsFile = async (userInfo) => {
    try {
      const content = `Identifiants de connexion\n\n` +
        `Nom: ${userInfo.nom}\n` +
        `Email: ${userInfo.email}\n` +
        `Mot de passe: ${userInfo.password}\n`;
      
      const fileUri = `${FileSystem.documentDirectory}identifiants.txt`;
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Enregistrer les identifiants'
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la génération du fichier:", error);
      return false;
    }
  };

  // Fonction pour ajouter le bon type d'utilisateur
  const handleAddUser = async () => {
    if (modalType === 'add_prof') {
      await handleAddProf();
    } else if (modalType === 'add_student') {
      await handleAddStudent();
    } else if (modalType === 'add_parent') {
      await handleAddParent();
    }
  };

  // Ajouter un professeur
  const handleAddProf = async () => {
    if (!formData.nom || !formData.email || !formData.subject || !formData.school_id) {
      setFeedback('Tous les champs sont obligatoires pour un professeur');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setFeedback('Format d\'email invalide');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    const originalEmail = formData.email;
    const validEmail = convertToValidEmail(formData.email);
    
    if (originalEmail !== validEmail) {
      setFeedback(`Email converti: ${originalEmail} → ${validEmail}`);
      setTimeout(() => setFeedback(''), 5000);
    }

    setLoading(true);
    try {
      const temporaryPassword = generatePassword();
      
      // Créer l'utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validEmail,
        password: temporaryPassword,
        options: {
          emailRedirectTo: undefined,
          data: {
            user_type: 'professor',
            name: formData.nom
          }
        }
      });

      if (authError) {
        setFeedback('Erreur : ' + authError.message);
        setLoading(false);
        setTimeout(() => setFeedback(''), 3000);
        return;
      }

      // Insérer dans la table profs
      const insertData = {
        nom: formData.nom,
        email: validEmail,
        user_id: authData.user?.id,
        subject: formData.subject,
        classe: formData.classe,
        school_id: formData.school_id
      };

      const { error } = await supabase.from('profs').insert(insertData);

      if (error) {
        setFeedback('Erreur : ' + error.message);
      } else {
        // Générer les identifiants
        const userInfo = {
          nom: formData.nom,
          email: validEmail,
          password: temporaryPassword,
          subject: formData.subject,
          classe: formData.classe,
          school_id: formData.school_id
        };

        const fileGenerated = await generateCredentialsFile(userInfo);
        
        if (fileGenerated) {
          setFeedback(`✅ Professeur ajouté avec succès !`);
        } else {
          setFeedback(`✅ Professeur ajouté! Mot de passe: ${temporaryPassword}`);
        }
        
        setModalVisible(false);
        setFormData({
          nom: '',
          email: '',
          subject: '',
          classe: '',
          school_id: '',
          parent_email: ''
        });
        loadUsers();
      }
    } catch (err) {
      setFeedback('Erreur inattendue');
    }

    setLoading(false);
    setTimeout(() => setFeedback(''), 5000);
  };

  // Ajouter un étudiant
  const handleAddStudent = async () => {
    if (!formData.nom || !formData.email || !formData.classe || !formData.school_id) {
      setFeedback('Nom, email, classe et identifiant sont obligatoires');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setFeedback('Format d\'email invalide');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    const originalEmail = formData.email;
    const validEmail = convertToValidEmail(formData.email);
    
    if (originalEmail !== validEmail) {
      setFeedback(`Email converti: ${originalEmail} → ${validEmail}`);
      setTimeout(() => setFeedback(''), 5000);
    }

    setLoading(true);
    try {
      const temporaryPassword = generatePassword();
      
      // Créer l'utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validEmail,
        password: temporaryPassword,
        options: {
          emailRedirectTo: undefined,
          data: {
            user_type: 'student',
            name: formData.nom
          }
        }
      });

      if (authError) {
        setFeedback('Erreur : ' + authError.message);
        setLoading(false);
        setTimeout(() => setFeedback(''), 3000);
        return;
      }

      // Insérer dans la table students
      const insertData = {
        nom: formData.nom,
        email: validEmail,
        user_id: authData.user?.id,
        classe: formData.classe,
        school_id: formData.school_id,
        parent_email: formData.parent_email
      };

      const { error } = await supabase.from('students').insert(insertData);

      if (error) {
        setFeedback('Erreur : ' + error.message);
      } else {
        // Générer les identifiants
        const userInfo = {
          nom: formData.nom,
          email: validEmail,
          password: temporaryPassword,
          classe: formData.classe,
          school_id: formData.school_id
        };

        const fileGenerated = await generateCredentialsFile(userInfo);
        
        if (fileGenerated) {
          setFeedback(`✅ Élève ajouté avec succès !`);
        } else {
          setFeedback(`✅ Élève ajouté! Mot de passe: ${temporaryPassword}`);
        }
        
        setModalVisible(false);
        setFormData({
          nom: '',
          email: '',
          subject: '',
          classe: '',
          school_id: '',
          parent_email: ''
        });
        loadUsers();
      }
    } catch (err) {
      setFeedback('Erreur inattendue');
    }

    setLoading(false);
    setTimeout(() => setFeedback(''), 5000);
  };

  // Ajouter un parent
  const handleAddParent = async () => {
    if (!formData.nom || !formData.email) {
      setFeedback('Nom et email sont obligatoires');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setFeedback('Format d\'email invalide');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    const originalEmail = formData.email;
    const validEmail = convertToValidEmail(formData.email);
    
    if (originalEmail !== validEmail) {
      setFeedback(`Email converti: ${originalEmail} → ${validEmail}`);
      setTimeout(() => setFeedback(''), 5000);
    }

    setLoading(true);
    try {
      const temporaryPassword = generatePassword();
      
      // Créer l'utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validEmail,
        password: temporaryPassword,
        options: {
          emailRedirectTo: undefined,
          data: {
            user_type: 'parent',
            name: formData.nom
          }
        }
      });

      if (authError) {
        setFeedback('Erreur : ' + authError.message);
        setLoading(false);
        setTimeout(() => setFeedback(''), 3000);
        return;
      }

      // Insérer dans la table parents
      const insertData = {
        nom: formData.nom,
        email: validEmail,
        user_id: authData.user?.id
      };

      const { error } = await supabase.from('parents').insert(insertData);

      if (error) {
        setFeedback('Erreur : ' + error.message);
      } else {
        // Générer les identifiants
        const userInfo = {
          nom: formData.nom,
          email: validEmail,
          password: temporaryPassword
        };

        const fileGenerated = await generateCredentialsFile(userInfo);
        
        if (fileGenerated) {
          setFeedback(`✅ Parent ajouté avec succès !`);
        } else {
          setFeedback(`✅ Parent ajouté! Mot de passe: ${temporaryPassword}`);
        }
        
        setModalVisible(false);
        setFormData({
          nom: '',
          email: '',
          subject: '',
          classe: '',
          school_id: '',
          parent_email: ''
        });
        loadUsers();
      }
    } catch (err) {
      setFeedback('Erreur inattendue');
    }

    setLoading(false);
    setTimeout(() => setFeedback(''), 5000);
  };

  // Fermer le modal et réinitialiser le formulaire
  const closeModal = () => {
    setModalVisible(false);
    setFormData({
      nom: '',
      email: '',
      subject: '',
      classe: '',
      school_id: '',
      parent_email: ''
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* En-tête simplifié */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🏫</Text>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Administration</Text>
              <Text style={styles.headerSubtitle}>
                Gestion des utilisateurs
              </Text>
            </View>
            {loading && (
              <ActivityIndicator size="small" color="white" style={{ marginLeft: 10 }} />
            )}
          </View>
          
          {/* Message de feedback */}
          {feedback ? (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}
        </View>

        {/* Zone de rafraîchissement */}
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={loadUsers}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>🔄 Actualiser les données</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollContainer}>
          {/* Grands boutons d'action principaux */}
          <View style={styles.mainActions}>
            <Text style={styles.sectionTitle}>Ajouter un utilisateur</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.profButton]}
                onPress={() => {
                  setModalType('add_prof');
                  setModalVisible(true);
                }}
              >
                <Text style={styles.actionButtonIcon}>👨‍🏫</Text>
                <Text style={styles.actionButtonText}>Ajouter un professeur</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.studentButton]}
                onPress={() => {
                  setModalType('add_student');
                  setModalVisible(true);
                }}
              >
                <Text style={styles.actionButtonIcon}>👨‍🎓</Text>
                <Text style={styles.actionButtonText}>Ajouter un élève</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.parentButton]}
                onPress={() => {
                  setModalType('add_parent');
                  setModalVisible(true);
                }}
              >
                <Text style={styles.actionButtonIcon}>👨‍👩‍👧‍👦</Text>
                <Text style={styles.actionButtonText}>Ajouter un parent</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Statistiques simplifiée */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Nombre d'utilisateurs</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>👨‍🏫</Text>
                <Text style={styles.statCount}>{profs.length}</Text>
                <Text style={styles.statLabel}>Professeurs</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>👨‍🎓</Text>
                <Text style={styles.statCount}>{students.length}</Text>
                <Text style={styles.statLabel}>Élèves</Text>
              </View>
              
              <View style={styles.statBox}>
                <Text style={styles.statIcon}>👨‍👩‍👧‍👦</Text>
                <Text style={styles.statCount}>{parents.length}</Text>
                <Text style={styles.statLabel}>Parents</Text>
              </View>
            </View>
          </View>

          {/* Liste des utilisateurs - avec sélecteurs d'onglets simplifiés */}
          <View style={styles.userListSection}>
            <Text style={styles.sectionTitle}>Liste des utilisateurs</Text>
            
            {/* Liste des professeurs */}
            <View style={styles.userCategory}>
              <Text style={styles.categoryTitle}>Professeurs</Text>
              
              {profs.length === 0 ? (
                <Text style={styles.emptyMessage}>Aucun professeur enregistré</Text>
              ) : (
                profs.map((prof) => (
                  <View key={prof.id} style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userCardIcon}>👨‍🏫</Text>
                      <View>
                        <Text style={styles.userName}>{prof.nom}</Text>
                        <Text style={styles.userDetail}>{prof.email}</Text>
                        {prof.subject && <Text style={styles.userDetail}>Matière: {prof.subject}</Text>}
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser('profs', prof.id, prof.nom)}
                    >
                      <Text style={styles.deleteButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
            
            {/* Liste des élèves */}
            <View style={styles.userCategory}>
              <Text style={styles.categoryTitle}>Élèves</Text>
              
              {students.length === 0 ? (
                <Text style={styles.emptyMessage}>Aucun élève enregistré</Text>
              ) : (
                students.map((student) => (
                  <View key={student.id} style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userCardIcon}>👨‍🎓</Text>
                      <View>
                        <Text style={styles.userName}>{student.nom}</Text>
                        <Text style={styles.userDetail}>{student.email}</Text>
                        {student.classe && <Text style={styles.userDetail}>Classe: {student.classe}</Text>}
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser('students', student.id, student.nom)}
                    >
                      <Text style={styles.deleteButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
            
            {/* Liste des parents */}
            <View style={styles.userCategory}>
              <Text style={styles.categoryTitle}>Parents</Text>
              
              {parents.length === 0 ? (
                <Text style={styles.emptyMessage}>Aucun parent enregistré</Text>
              ) : (
                parents.map((parent) => (
                  <View key={parent.id} style={styles.userCard}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userCardIcon}>👨‍👩‍👧‍👦</Text>
                      <View>
                        <Text style={styles.userName}>{parent.nom}</Text>
                        <Text style={styles.userDetail}>{parent.email}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser('parents', parent.id, parent.nom)}
                    >
                      <Text style={styles.deleteButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        {/* Modal d'ajout utilisateur simplifié */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView 
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {modalType === 'add_prof' ? 'Ajouter un professeur' :
                modalType === 'add_student' ? 'Ajouter un élève' : 
                'Ajouter un parent'}
              </Text>

              {/* Champ nom */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom complet</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Exemple: Jean Dupont"
                  value={formData.nom}
                  onChangeText={(text) => setFormData({...formData, nom: text})}
                />
              </View>

              {/* Champ email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Exemple: jean.dupont@gmail.com"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Champs spécifiques professeur */}
              {modalType === 'add_prof' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Matière enseignée</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Exemple: Mathématiques"
                      value={formData.subject}
                      onChangeText={(text) => setFormData({...formData, subject: text})}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Classes</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Exemple: 6A, 5B, 4C"
                      value={formData.classe}
                      onChangeText={(text) => setFormData({...formData, classe: text})}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Identifiant d'école</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Exemple: ECO123"
                      value={formData.school_id}
                      onChangeText={(text) => setFormData({...formData, school_id: text})}
                    />
                  </View>
                </>
              )}

              {/* Champs spécifiques élève */}
              {modalType === 'add_student' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Classe</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Exemple: 6A"
                      value={formData.classe}
                      onChangeText={(text) => setFormData({...formData, classe: text})}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email du parent (optionnel)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Exemple: parent@gmail.com"
                      value={formData.parent_email}
                      onChangeText={(text) => setFormData({...formData, parent_email: text})}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Identifiant d'école</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Exemple: ECO123"
                      value={formData.school_id}
                      onChangeText={(text) => setFormData({...formData, school_id: text})}
                    />
                  </View>
                </>
              )}

              {/* Boutons d'action */}
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleAddUser}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Ajout en cours...' : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  
  // En-tête
  header: {
    backgroundColor: '#4285F4',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerIcon: {
    fontSize: 35,
    marginRight: 15,
  },
  
  headerText: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  
  // Feedback
  feedbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 15,
    padding: 10,
    borderRadius: 10,
  },
  
  feedbackText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Bouton d'actualisation
  refreshButton: {
    backgroundColor: 'white',
    margin: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 1,
  },
  
  refreshButtonText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '500',
  },
  
  // Contenu principal
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  
  // Titres de sections
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  
  // Actions principales
  mainActions: {
    marginBottom: 25,
  },
  
  actionButtons: {
    gap: 12,
  },
  
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  
  profButton: {
    borderLeftWidth: 6,
    borderLeftColor: '#4285F4',
  },
  
  studentButton: {
    borderLeftWidth: 6,
    borderLeftColor: '#0F9D58',
  },
  
  parentButton: {
    borderLeftWidth: 6,
    borderLeftColor: '#F4B400',
  },
  
  actionButtonIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  
  actionButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  
  // Section statistiques
  statsSection: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  statBox: {
    alignItems: 'center',
    padding: 15,
  },
  
  statIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  
  // Section liste utilisateurs
  userListSection: {
    marginBottom: 25,
  },
  
  userCategory: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#4285F4',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  
  emptyMessage: {
    textAlign: 'center',
    padding: 15,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  userCardIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  userDetail: {
    fontSize: 14,
    color: '#666',
  },
  
  deleteButton: {
    backgroundColor: '#DB4437',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    maxHeight: '90%',
  },
  
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4285F4',
  },
  
  inputGroup: {
    marginBottom: 15,
  },
  
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  
  submitButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});
