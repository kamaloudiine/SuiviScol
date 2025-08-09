// VERSION PRE-SECURITY - Avant implémentation BackHandler
// Interface complète mais sans sécurité navigation

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { Button, Card, FAB } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../supabaseClient';

export default function AccueilEleve() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingAbsences, setLoadingAbsences] = useState(false);
  
  // États pour la justification d'absence
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);
  const [justificationReason, setJustificationReason] = useState('');
  const [submittingJustification, setSubmittingJustification] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data: studentData } = await supabase
        .from('students')
        .select('nom, classe, id, user_id')
        .eq('user_id', user.id)
        .single();
      setStudent(studentData);
      
      if (studentData) {
        setLoadingNotes(true);
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('subject, value, date, comment, evaluation, coefficient')
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });
        
        if (notesError) {
          setNotes([]);
        } else {
          setNotes(notesData || []);
        }
        setLoadingNotes(false);
        
        setLoadingAbsences(true);
        const { data: absencesData, error: absencesError } = await supabase
          .from('absences')
          .select('id, date, subject, justified, reason, created_at')
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });
        
        if (absencesError) {
          setAbsences([]);
        } else {
          setAbsences(absencesData || []);
        }
        setLoadingAbsences(false);
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

  // ❌ PAS DE GESTION BackHandler ici - Version pré-sécurité

  // Ouvrir le modal de justification
  const openJustificationModal = (absence) => {
    setSelectedAbsence(absence);
    setJustificationReason(absence.reason || '');
    setModalVisible(true);
  };

  // Soumettre la justification
  const submitJustification = async () => {
    if (!justificationReason.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une raison pour justifier votre absence.');
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
        Alert.alert('Erreur', 'Impossible de justifier l\'absence. Réessayez plus tard.');
      } else {
        Alert.alert('Succès', 'Votre absence a été justifiée avec succès.');
        setModalVisible(false);
        
        // Recharger les absences
        if (student) {
          setLoadingAbsences(true);
          const { data: absencesData } = await supabase
            .from('absences')
            .select('id, date, subject, justified, reason, created_at')
            .eq('student_id', student.id)
            .order('date', { ascending: false });
          setAbsences(absencesData || []);
          setLoadingAbsences(false);
        }
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    }

    setSubmittingJustification(false);
  };

  // Fermer le modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedAbsence(null);
    setJustificationReason('');
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
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
        {/* Header moderne thème élève */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🎓</Text>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Mon Espace Élève</Text>
              <Text style={styles.headerSubtitle}>
                {student ? `${student.nom} - Classe ${student.classe}` : 'Chargement...'}
              </Text>
            </View>
            {/* ❌ PAS DE BOUTON LOGOUT - Version pré-sécurité */}
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Onglets modernes */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.modernTab, activeTab === 'notes' && styles.modernActiveTab]}
              onPress={() => setActiveTab('notes')}
            >
              <Text style={[styles.modernTabText, activeTab === 'notes' && styles.modernActiveTabText]}>
                📚 Mes Notes
              </Text>
              <Text style={[styles.modernTabSubtext, activeTab === 'notes' && styles.modernActiveTabSubtext]}>
                {notes.length} note{notes.length > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modernTab, activeTab === 'absences' && styles.modernActiveTab]}
              onPress={() => setActiveTab('absences')}
            >
              <Text style={[styles.modernTabText, activeTab === 'absences' && styles.modernActiveTabText]}>
                🚫 Mes Absences
              </Text>
              <Text style={[styles.modernTabSubtext, activeTab === 'absences' && styles.modernActiveTabSubtext]}>
                {absences.length} absence{absences.length > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'notes' ? (
            // Section Notes modernisée - AVEC .map() (problème FlatList déjà corrigé)
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>
                📊 Mes Notes ({notes.length})
              </Text>
              {loadingNotes ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2196F3" />
                  <Text style={styles.loadingText}>Chargement des notes...</Text>
                </View>
              ) : (
                <>
                  {notes.length > 0 ? (
                    <>
                      {notes.map((item, index) => (
                        <Card key={index} style={styles.noteCard}>
                          <Card.Content>
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
                          </Card.Content>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <Card style={styles.emptyCard}>
                      <Card.Content>
                        <Text style={styles.emptyText}>Aucune note pour le moment</Text>
                        <Text style={styles.emptySubtext}>
                          Vos notes apparaîtront ici dès qu'elles seront saisies par vos professeurs
                        </Text>
                      </Card.Content>
                    </Card>
                  )}
                </>
              )}
            </View>
          ) : (
            // Section Absences modernisée - AVEC .map()
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>
                ⚠️ Mes Absences ({absences.length})
              </Text>
              {loadingAbsences ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#F44336" />
                  <Text style={styles.loadingText}>Chargement des absences...</Text>
                </View>
              ) : (
                <>
                  {absences.length > 0 ? (
                    <>
                      {absences.map((item, index) => (
                        <Card key={index} style={styles.absenceCard}>
                          <Card.Content>
                            <View style={styles.absenceHeader}>
                              <Text style={styles.absenceSubject}>{item.subject}</Text>
                              <View style={[
                                styles.absenceStatus,
                                { backgroundColor: item.justified ? '#4CAF50' : '#F44336' }
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
                              <Button
                                mode="contained"
                                icon="pencil"
                                style={styles.justifyButton}
                                buttonColor="#FF9800"
                                onPress={() => openJustificationModal(item)}
                              >
                                Justifier
                              </Button>
                            )}
                          </Card.Content>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <Card style={styles.emptyCard}>
                      <Card.Content>
                        <Text style={styles.emptyText}>Aucune absence enregistrée ! 🎉</Text>
                        <Text style={styles.emptySubtext}>
                          Continuez comme ça, votre assiduité est exemplaire !
                        </Text>
                      </Card.Content>
                    </Card>
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>

        {/* FAB pour actions rapides */}
        <FAB
          icon="refresh"
          style={styles.fab}
          color="white"
          onPress={() => window.location.reload()}
        />

      {/* Modal de justification d'absence */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Justifier mon absence</Text>
            
            {selectedAbsence && (
              <View style={styles.absenceInfo}>
                <Text style={styles.absenceInfoText}>
                  📅 Date: {new Date(selectedAbsence.date).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.absenceInfoText}>
                  📚 Matière: {selectedAbsence.subject}
                </Text>
              </View>
            )}
            
            <Text style={styles.inputLabel}>Raison de l'absence :</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Maladie, rendez-vous médical, problème familial..."
              value={justificationReason}
              onChangeText={setJustificationReason}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
                disabled={submittingJustification}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitJustification}
                disabled={submittingJustification}
              >
                <Text style={styles.submitButtonText}>
                  {submittingJustification ? 'Envoi...' : 'Justifier'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {submittingJustification && (
              <ActivityIndicator size="small" color="#3F51B5" style={{ marginTop: 10 }} />
            )}
          </View>
        </View>
      </Modal>
      </View>
    </>
  );
}

// Styles identiques à la version finale
const styles = StyleSheet.create({
  // ... tous les styles de la version finale
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  
  // ... autres styles
});
