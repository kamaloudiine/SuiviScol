// VERSION PRE-VALIDATION - AccueilProf avant validation notes ≤20
// Interface professeur avec FlatList et sans validation des notes

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, TextInput, FlatList, Keyboard, ScrollView } from 'react-native';
import { Button, Card, FAB } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../supabaseClient';

export default function AccueilProf() {
  const router = useRouter();
  const [professorData, setProfessorData] = useState(null);
  const [classesTabs, setClassesTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // États pour le modal de note
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [noteComment, setNoteComment] = useState('');
  const [noteEvaluation, setNoteEvaluation] = useState('');
  const [noteCoefficient, setNoteCoefficient] = useState('1');
  const [submittingNote, setSubmittingNote] = useState(false);

  // États pour le modal d'absence
  const [absenceModalVisible, setAbsenceModalVisible] = useState(false);
  const [selectedStudentAbsence, setSelectedStudentAbsence] = useState(null);
  const [absenceReason, setAbsenceReason] = useState('');
  const [submittingAbsence, setSubmittingAbsence] = useState(false);

  useEffect(() => {
    fetchProfessorData();
  }, []);

  const fetchProfessorData = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data: profData, error: profError } = await supabase
        .from('professors')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profError || !profData) {
        console.log('Erreur prof:', profError);
        setLoading(false);
        return;
      }
      
      setProfessorData(profData);
      
      const tabsData = [];
      
      for (const classe of profData.classe) {
        const { data: studentsData } = await supabase
          .from('students')
          .select('id, nom, classe')
          .eq('classe', classe);
        
        const notesMap = {};
        
        for (const student of studentsData || []) {
          const { data: latestNote } = await supabase
            .from('notes')
            .select('value, date, comment, evaluation, coefficient')
            .eq('student_id', student.id)
            .eq('subject', profData.subject)
            .order('date', { ascending: false })
            .limit(1)
            .single();
          
          notesMap[student.id] = latestNote;
        }
        
        tabsData.push({
          classe,
          eleves: studentsData || [],
          notes: notesMap,
          subject: profData.subject
        });
      }
      
      setClassesTabs(tabsData);
    } catch (error) {
      console.log('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir modal pour ajouter une note
  const openModal = (student) => {
    setSelectedStudent(student);
    setNoteValue('');
    setNoteComment('');
    setNoteEvaluation('');
    setNoteCoefficient('1');
    setModalVisible(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedStudent(null);
    Keyboard.dismiss();
  };

  // ❌ PAS DE VALIDATION DE NOTE ici - Version pré-validation
  const submitNote = async () => {
    if (!noteValue.trim()) {
      alert('Veuillez saisir une note');
      return;
    }

    // ❌ AUCUNE VALIDATION : note peut être > 20
    const note = parseFloat(noteValue);
    if (isNaN(note)) {
      alert('Veuillez saisir une note valide');
      return;
    }

    setSubmittingNote(true);

    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          student_id: selectedStudent.id,
          subject: professorData.subject,
          value: note, // ❌ Pas de validation ≤20
          comment: noteComment.trim(),
          evaluation: noteEvaluation.trim(),
          coefficient: parseFloat(noteCoefficient) || 1,
          date: new Date().toISOString()
        });

      if (error) {
        console.log('Erreur note:', error);
        alert('Erreur lors de l\'ajout de la note');
      } else {
        alert('Note ajoutée avec succès !');
        closeModal();
        await fetchProfessorData(); // Rafraîchir les données
      }
    } catch (err) {
      console.log('Erreur:', err);
      alert('Une erreur inattendue s\'est produite');
    }

    setSubmittingNote(false);
  };

  // Ouvrir modal pour absence
  const openAbsenceModal = (student) => {
    setSelectedStudentAbsence(student);
    setAbsenceReason('');
    setAbsenceModalVisible(true);
  };

  // Fermer modal absence
  const closeAbsenceModal = () => {
    setAbsenceModalVisible(false);
    setSelectedStudentAbsence(null);
    Keyboard.dismiss();
  };

  // Soumettre absence
  const submitAbsence = async () => {
    setSubmittingAbsence(true);

    try {
      const { error } = await supabase
        .from('absences')
        .insert({
          student_id: selectedStudentAbsence.id,
          subject: professorData.subject,
          date: new Date().toISOString(),
          justified: false,
          reason: absenceReason.trim() || null
        });

      if (error) {
        console.log('Erreur absence:', error);
        alert('Erreur lors de l\'enregistrement de l\'absence');
      } else {
        alert('Absence enregistrée avec succès !');
        closeAbsenceModal();
      }
    } catch (err) {
      console.log('Erreur:', err);
      alert('Une erreur inattendue s\'est produite');
    }

    setSubmittingAbsence(false);
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

  if (!professorData || classesTabs.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <Text style={styles.errorText}>Aucune classe assignée</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header moderne thème professeur */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>👨‍🏫</Text>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Espace Professeur</Text>
              <Text style={styles.headerSubtitle}>
                {professorData.nom} - {professorData.subject}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Onglets des classes */}
          <View style={styles.tabsContainer}>
            {classesTabs.map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.modernTab, activeTab === index && styles.modernActiveTab]}
                onPress={() => setActiveTab(index)}
              >
                <Text style={[styles.modernTabText, activeTab === index && styles.modernActiveTabText]}>
                  📚 {tab.classe}
                </Text>
                <Text style={[styles.modernTabSubtext, activeTab === index && styles.modernActiveTabSubtext]}>
                  {tab.eleves?.length || 0} élève{(tab.eleves?.length || 0) > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contenu de l'onglet actif */}
          {classesTabs[activeTab] && (
            <View style={styles.contentSection}>
              {/* Informations de la classe */}
              <Card style={styles.classInfoCard}>
                <Card.Content>
                  <Text style={styles.classTitle}>
                    📖 Classe {classesTabs[activeTab].classe} - {classesTabs[activeTab].subject}
                  </Text>
                  <Text style={styles.classSubtitle}>
                    {classesTabs[activeTab].eleves?.length || 0} élève{(classesTabs[activeTab].eleves?.length || 0) > 1 ? 's' : ''} inscrit{(classesTabs[activeTab].eleves?.length || 0) > 1 ? 's' : ''}
                  </Text>
                </Card.Content>
              </Card>
              
              <View style={styles.studentsHeader}>
                <Text style={styles.studentsTitle}>👥 Élèves ({classesTabs[activeTab].eleves?.length || 0})</Text>
              </View>
              
              {/* ❌ PROBLÈME : FlatList dans ScrollView */}
              <FlatList
                data={classesTabs[activeTab].eleves}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Card style={styles.studentCard}>
                    <Card.Content>
                      <View style={styles.studentCardContent}>
                        <View style={styles.studentInfo}>
                          <Text style={styles.studentName}>👤 {item.nom}</Text>
                          <Text style={styles.studentNote}>
                            {classesTabs[activeTab].notes[item.id]?.value !== undefined 
                              ? `📝 Dernière note: ${classesTabs[activeTab].notes[item.id].value}/20` 
                              : '📝 Aucune note'}
                          </Text>
                        </View>
                        <View style={styles.studentActions}>
                          <Button
                            mode="contained"
                            icon="plus"
                            compact
                            style={styles.actionButtonNote}
                            buttonColor="#4CAF50"
                            onPress={() => openModal(item)}
                          >
                            Note
                          </Button>
                          <Button
                            mode="contained"
                            icon="account-remove"
                            compact
                            style={styles.actionButtonAbsence}
                            buttonColor="#F44336"
                            onPress={() => openAbsenceModal(item)}
                          >
                            Absence
                          </Button>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                )}
              />
            </View>
          )}
        </ScrollView>

        {/* FAB pour actions rapides */}
        <FAB
          icon="plus"
          style={styles.fab}
          color="white"
          onPress={() => {
            if (classesTabs[activeTab]?.eleves?.length > 0) {
              openModal(classesTabs[activeTab].eleves[0]);
            }
          }}
        />

        {/* Modal d'ajout de note */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ajouter une note</Text>
              
              {selectedStudent && (
                <View style={styles.studentInfo}>
                  <Text style={styles.studentInfoText}>
                    👤 Élève: {selectedStudent.nom}
                  </Text>
                  <Text style={styles.studentInfoText}>
                    📚 Matière: {professorData?.subject}
                  </Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Note sur 20 :</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 15.5"
                  value={noteValue}
                  onChangeText={setNoteValue}
                  keyboardType="numeric"
                  maxLength={5}
                />
                {/* ❌ PAS D'INDICATION de limite ≤20 */}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Type d'évaluation :</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Contrôle, Devoir, Interrogation..."
                  value={noteEvaluation}
                  onChangeText={setNoteEvaluation}
                  maxLength={50}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Coefficient :</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: 1, 2, 0.5..."
                  value={noteCoefficient}
                  onChangeText={setNoteCoefficient}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Commentaire (optionnel) :</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Commentaire sur la performance de l'élève..."
                  value={noteComment}
                  onChangeText={setNoteComment}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                  disabled={submittingNote}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={submitNote}
                  disabled={submittingNote}
                >
                  <Text style={styles.submitButtonText}>
                    {submittingNote ? 'Ajout...' : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {submittingNote && (
                <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 10 }} />
              )}
            </View>
          </View>
        </Modal>

        {/* Modal d'absence */}
        <Modal
          visible={absenceModalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeAbsenceModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enregistrer une absence</Text>
              
              {selectedStudentAbsence && (
                <View style={styles.studentInfo}>
                  <Text style={styles.studentInfoText}>
                    👤 Élève: {selectedStudentAbsence.nom}
                  </Text>
                  <Text style={styles.studentInfoText}>
                    📚 Matière: {professorData?.subject}
                  </Text>
                  <Text style={styles.studentInfoText}>
                    📅 Date: {new Date().toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Raison (optionnel) :</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Raison de l'absence si connue..."
                  value={absenceReason}
                  onChangeText={setAbsenceReason}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeAbsenceModal}
                  disabled={submittingAbsence}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={submitAbsence}
                  disabled={submittingAbsence}
                >
                  <Text style={styles.submitButtonText}>
                    {submittingAbsence ? 'Enregistrement...' : 'Enregistrer'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {submittingAbsence && (
                <ActivityIndicator size="small" color="#F44336" style={{ marginTop: 10 }} />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

// Styles identiques mais sans les améliorations de validation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  
  // ... autres styles identiques
  
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});
