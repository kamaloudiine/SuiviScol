import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, TextInput, Alert, ScrollView, BackHandler } from 'react-native';
import { Button, Card, FAB } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../supabaseClient';

export default function AccueilParent() {
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childNotes, setChildNotes] = useState([]);
  const [childAbsences, setChildAbsences] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingAbsences, setLoadingAbsences] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' ou 'absences'

  // États pour la justification d'absence
  const [justificationModalVisible, setJustificationModalVisible] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [justificationReason, setJustificationReason] = useState('');
  const [submittingJustification, setSubmittingJustification] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        // 1. Récupérer l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        console.log('Parent connecté:', user.email);

        // Récupérer directement les enfants par email du parent
        const { data: childrenData, error } = await supabase
          .from('students')
          .select('id, nom, classe')
          .eq('parent_email', user.email);

        if (error) {
          console.log('Erreur récupération enfants:', error);
          setChildren([]);
        } else {
          setChildren(childrenData || []);
        }
      } catch (err) {
        console.log('Erreur générale:', err);
        setChildren([]);
      }
      
      setLoading(false);
    };

    fetchChildren();
  }, []);

  // Gestion du bouton retour arrière
  useEffect(() => {
    const backAction = () => {
      // Rediriger vers l'index au lieu de permettre le retour vers login
      router.replace('/');
      return true; // Empêche le comportement par défaut
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [router]);

  // Fonction de déconnexion
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  // Fonction pour récupérer les notes d'un enfant
  const fetchChildNotes = async (child) => {
    setSelectedChild(child);
    setLoadingNotes(true);
    setLoadingAbsences(true);
    setActiveTab('notes');
    setModalVisible(true);

    try {
      // Récupérer les notes
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('value, comment, subject, date, evaluation, coefficient')
        .eq('student_id', child.id)
        .order('date', { ascending: false });

      if (notesError) {
        console.log('Erreur récupération notes:', notesError);
        setChildNotes([]);
      } else {
        setChildNotes(notesData || []);
      }

      // Récupérer les absences
      const { data: absencesData, error: absencesError } = await supabase
        .from('absences')
        .select('id, date, subject, justified, reason, created_at')
        .eq('student_id', child.id)
        .order('date', { ascending: false });

      if (absencesError) {
        console.log('Erreur récupération absences:', absencesError);
        setChildAbsences([]);
      } else {
        setChildAbsences(absencesData || []);
      }
    } catch (err) {
      console.log('Erreur générale:', err);
      setChildNotes([]);
      setChildAbsences([]);
    }

    setLoadingNotes(false);
    setLoadingAbsences(false);
  };

  // Fermer le modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedChild(null);
    setChildNotes([]);
    setChildAbsences([]);
    setActiveTab('notes');
  };

  // Ouvrir le modal de justification
  const openJustificationModal = (absence) => {
    setModalVisible(false); // Fermer le modal principal
    setSelectedAbsence(absence);
    setJustificationReason(absence.reason || '');
    
    // Délai pour laisser le temps au modal principal de se fermer
    setTimeout(() => {
      setJustificationModalVisible(true);
    }, 300);
  };

  // Fermer le modal de justification
  const closeJustificationModal = () => {
    setJustificationModalVisible(false);
    setSelectedAbsence(null);
    setJustificationReason('');
    // Rouvrir le modal principal après fermeture
    setTimeout(() => {
      setModalVisible(true);
    }, 300);
  };

  // Soumettre la justification
  const submitJustification = async () => {
    if (!justificationReason.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une raison pour justifier cette absence.');
      return;
    }

    setSubmittingJustification(true);

    try {
      const { error } = await supabase
        .from('absences')
        .update({
          justified: true,
          reason: justificationReason.trim()
        })
        .eq('id', selectedAbsence.id);

      if (error) {
        console.log('Erreur justification:', error);
        Alert.alert('Erreur', 'Impossible de justifier l\'absence. Veuillez réessayer.');
      } else {
        Alert.alert('Succès', 'L\'absence a été justifiée avec succès.');
        
        // Recharger les absences pour avoir les données à jour
        if (selectedChild) {
          const { data: updatedAbsencesData } = await supabase
            .from('absences')
            .select('id, date, subject, justified, reason, created_at')
            .eq('student_id', selectedChild.id)
            .order('date', { ascending: false });
          
          if (updatedAbsencesData) {
            setChildAbsences(updatedAbsencesData);
          }
        }
        
        closeJustificationModal();
      }
    } catch (err) {
      console.log('Erreur:', err);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    }

    setSubmittingJustification(false);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header moderne thème parent */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>👨‍👩‍👧‍👦</Text>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Espace Parent</Text>
              <Text style={styles.headerSubtitle}>
                Suivi de {children.length} enfant{children.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.childrenSection}>
            <Text style={styles.sectionTitle}>Mes Enfants</Text>
            
            {children.length > 0 ? (
              children.map((child, index) => (
                <Card key={index} style={styles.childCard}>
                  <Card.Content>
                    <View style={styles.childCardContent}>
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>👤 {child.nom}</Text>
                        <Text style={styles.childClass}>🏫 Classe {child.classe}</Text>
                      </View>
                      <View style={styles.childActions}>
                        <Button
                          mode="contained"
                          icon="clipboard-text"
                          style={styles.actionButton}
                          buttonColor="#4CAF50"
                          onPress={() => fetchChildNotes(child)}
                        >
                          Consulter
                        </Button>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>Aucun enfant trouvé</Text>
                  <Text style={styles.emptySubtext}>
                    Vérifiez que votre email est correctement renseigné dans les données de l'école
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </ScrollView>

        {/* FAB pour actions rapides */}
        <FAB
          icon="refresh"
          style={styles.fab}
          color="white"
          onPress={() => window.location.reload()}
        />

      {/* Modal pour afficher les notes */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedChild?.nom} - Classe {selectedChild?.classe}
            </Text>
            
            {/* Onglets Notes/Absences */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
                onPress={() => setActiveTab('notes')}
              >
                <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
                  📚 Notes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'absences' && styles.activeTab]}
                onPress={() => setActiveTab('absences')}
              >
                <Text style={[styles.tabText, activeTab === 'absences' && styles.activeTabText]}>
                  🚫 Absences
                </Text>
              </TouchableOpacity>
            </View>
            
            {activeTab === 'notes' ? (
              // Onglet Notes
              loadingNotes ? (
                <ActivityIndicator size="large" color="#3F51B5" style={{ margin: 20 }} />
              ) : (
                <>
                  {childNotes.length > 0 ? (
                    <View style={styles.notesList}>
                      {childNotes.map((item, index) => (
                        <View key={index.toString()} style={styles.noteCard}>
                          <View style={styles.noteHeader}>
                            <Text style={styles.noteSubject}>{item.subject}</Text>
                            <Text style={styles.noteValue}>{item.value}/20</Text>
                          </View>
                          
                          <View style={styles.noteDetails}>
                            <Text style={styles.noteEvaluation}>
                              📝 {item.evaluation || 'Évaluation'}
                            </Text>
                            <Text style={styles.noteCoeff}>
                              ⚖️ Coeff: {item.coefficient || 1}
                            </Text>
                          </View>
                          
                          {item.comment && (
                            <Text style={styles.noteComment}>{item.comment}</Text>
                          )}
                          
                          <Text style={styles.noteDate}>
                            📅 {new Date(item.date).toLocaleDateString('fr-FR')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noData}>Aucune note trouvée</Text>
                  )}
                </>
              )
            ) : (
              // Onglet Absences
              loadingAbsences ? (
                <ActivityIndicator size="large" color="#FF5722" style={{ margin: 20 }} />
              ) : (
                <>
                  {childAbsences.length > 0 ? (
                    <View style={styles.absencesList}>
                      {childAbsences.map((item, index) => (
                        <View key={index.toString()} style={styles.absenceCard}>
                          <View style={styles.absenceHeader}>
                            <Text style={styles.absenceSubject}>{item.subject}</Text>
                            <View style={[
                              styles.absenceStatus,
                              { backgroundColor: item.justified ? '#4CAF50' : '#FF5722' }
                            ]}>
                              <Text style={styles.absenceStatusText}>
                                {item.justified ? 'Justifiée' : 'Non justifiée'}
                              </Text>
                            </View>
                          </View>
                          
                          <Text style={styles.absenceDate}>
                            📅 {new Date(item.date).toLocaleDateString('fr-FR')}
                          </Text>
                          
                          {item.reason && (
                            <Text style={styles.absenceReason}>
                              💬 {item.reason}
                            </Text>
                          )}
                          
                          {!item.justified && (
                            <TouchableOpacity 
                              style={styles.justifyButton}
                              onPress={() => openJustificationModal(item)}
                            >
                              <Text style={styles.justifyButtonText}>Justifier</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noData}>Aucune absence enregistrée</Text>
                  )}
                </>
              )
            )}
            
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de justification d'absence */}
      <Modal
        visible={justificationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeJustificationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.justificationModalContent}>
            <Text style={styles.justificationModalTitle}>
              Justifier l'absence
            </Text>
            
            {selectedAbsence && (
              <View style={styles.absenceInfo}>
                <Text style={styles.absenceInfoText}>
                  Matière : {selectedAbsence.subject}
                </Text>
                <Text style={styles.absenceInfoText}>
                  Date : {new Date(selectedAbsence.date).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            )}
            
            <Text style={styles.justificationLabel}>
              Motif de justification :
            </Text>
            
            <TextInput
              style={styles.justificationInput}
              placeholder="Saisissez le motif de l'absence..."
              value={justificationReason}
              onChangeText={setJustificationReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.justificationButtons}>
              <TouchableOpacity 
                style={styles.cancelJustificationButton} 
                onPress={closeJustificationModal}
              >
                <Text style={styles.cancelJustificationText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitJustificationButton, submittingJustification && styles.disabledButton]} 
                onPress={submitJustification}
                disabled={submittingJustification}
              >
                <Text style={styles.submitJustificationText}>
                  {submittingJustification ? 'Envoi...' : 'Justifier'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header moderne thème parent
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  
  headerText: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Roboto',
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  
  // Chargement
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Section des enfants
  childrenSection: {
    flex: 1,
    marginVertical: 16,
    marginTop: 24, // Marge supplémentaire en haut
    marginBottom: 80, // Espace pour FAB
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  
  // Cards des enfants
  childCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  
  childCardContent: {
    padding: 16,
  },
  
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  childClass: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  
  tapHint: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: '#E8F5E8',
    padding: 8,
    borderRadius: 6,
  },
  
  // Card vide
  emptyCard: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
    marginTop: 20,
  },
  
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
  
  // Modal de détails enfant
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  // Onglets dans le modal
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    elevation: 1,
  },
  
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Listes de notes et absences
  notesList: {
    maxHeight: 400,
  },
  
  absencesList: {
    maxHeight: 400,
  },
  
  // Cards des notes
  noteCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  noteSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  noteValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  
  noteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  noteEvaluation: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  noteCoeff: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  noteComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  
  noteDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  
  // Cards des absences
  absenceCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  
  absenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  absenceSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  absenceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  absenceStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  absenceDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  
  absenceReason: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Messages vides
  noNotes: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    margin: 20,
    fontStyle: 'italic',
  },
  
  noData: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    margin: 20,
    fontStyle: 'italic',
  },
  
  // Bouton de fermeture modal
  closeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Bouton justifier
  justifyButton: {
    backgroundColor: '#FF9800',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  
  justifyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Modal de justification
  justificationModalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    padding: 25,
    maxHeight: '80%',
    elevation: 10,
  },
  
  justificationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  absenceInfo: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  
  absenceInfoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  
  justificationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  
  justificationInput: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
  },
  
  justificationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  
  cancelJustificationButton: {
    flex: 1,
    backgroundColor: '#666',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  cancelJustificationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  submitJustificationButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  
  submitJustificationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  disabledButton: {
    opacity: 0.6,
  },
});

