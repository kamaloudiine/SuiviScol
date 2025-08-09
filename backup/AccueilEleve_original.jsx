// VERSION ORIGINALE - Avant modernisation UI/UX
// Interface basique avec styles simples

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
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
        // Récupérer les notes
        const { data: notesData } = await supabase
          .from('notes')
          .select('subject, value, date, comment, evaluation, coefficient')
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });
        setNotes(notesData || []);
        
        // Récupérer les absences
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
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Chargement...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header simple */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Espace Élève</Text>
          <Text style={styles.headerSubtitle}>
            {student ? `${student.nom} - ${student.classe}` : 'Chargement...'}
          </Text>
        </View>

        {/* Onglets basiques */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
            onPress={() => setActiveTab('notes')}
          >
            <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
              Notes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'absences' && styles.activeTab]}
            onPress={() => setActiveTab('absences')}
          >
            <Text style={[styles.tabText, activeTab === 'absences' && styles.activeTabText]}>
              Absences
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'notes' ? (
            <View>
              <Text style={styles.sectionTitle}>Mes Notes</Text>
              {notes.length > 0 ? (
                notes.map((item, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={styles.noteSubject}>{item.subject}</Text>
                    <Text style={styles.noteValue}>{item.value}/20</Text>
                    <Text style={styles.noteDate}>
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>Aucune note trouvée</Text>
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.sectionTitle}>Mes Absences</Text>
              {absences.length > 0 ? (
                absences.map((item, index) => (
                  <View key={index} style={styles.absenceItem}>
                    <Text style={styles.absenceSubject}>{item.subject}</Text>
                    <Text style={styles.absenceStatus}>
                      {item.justified ? 'Justifiée' : 'Non justifiée'}
                    </Text>
                    <Text style={styles.absenceDate}>
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noData}>Aucune absence enregistrée</Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}

// Styles basiques - Avant modernisation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  noteItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  noteSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noteValue: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
  },
  noteDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  absenceItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  absenceSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  absenceStatus: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  absenceDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});
