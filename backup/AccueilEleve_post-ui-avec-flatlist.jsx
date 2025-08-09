// VERSION POST-UI/UX - Avec FlatList (avant correction VirtualizedList)
// Interface modernisée mais avec erreurs VirtualizedList

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView, FlatList } from 'react-native';
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
        const { data: notesData } = await supabase
          .from('notes')
          .select('subject, value, date, comment, evaluation, coefficient')
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });
        setNotes(notesData || []);
        
        const { data: absencesData } = await supabase
          .from('absences')
          .select('id, date, subject, justified, reason, created_at')
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });
        setAbsences(absencesData || []);
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

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
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>
                📊 Mes Notes ({notes.length})
              </Text>
              {notes.length > 0 ? (
                // ❌ PROBLÈME : FlatList dans ScrollView
                <FlatList
                  data={notes}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <Card style={styles.noteCard}>
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
                  )}
                />
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
            </View>
          ) : (
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>
                ⚠️ Mes Absences ({absences.length})
              </Text>
              {absences.length > 0 ? (
                // ❌ PROBLÈME : FlatList dans ScrollView
                <FlatList
                  data={absences}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <Card style={styles.absenceCard}>
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
                  )}
                />
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
      </View>
    </>
  );
}

// Styles modernisés avec Material Design
const styles = StyleSheet.create({
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
  
  tabsContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 12,
  },
  
  modernTab: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  
  modernActiveTab: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  
  modernTabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  
  modernActiveTabText: {
    color: 'white',
  },
  
  modernTabSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  
  modernActiveTabSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  contentSection: {
    flex: 1,
    marginBottom: 80,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  
  // Autres styles...
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});
