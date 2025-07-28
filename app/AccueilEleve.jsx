// StudentScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function StudentScreen() {
  // Données factices pour les notes
  const mockGrades = [
    { id: '1', subject: 'Mathématiques', value: 15, date: '2023-11-20', comment: 'Bon travail' },
    { id: '2', subject: 'Français', value: 12, date: '2023-11-18', comment: 'Peut mieux faire' },
    { id: '3', subject: 'Histoire', value: 17, date: '2023-11-15', comment: 'Excellent' },
  ];
    const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bienvenue</Text>
      
      <Text style={styles.sectionTitle}>Mes dernières notes</Text>
      
      <FlatList
        data={mockGrades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gradeCard}>
            <View style={styles.gradeHeader}>
              <Text style={styles.subjectText}>{item.subject}</Text>
              <Text style={styles.gradeText}>{item.value}/20</Text>
            </View>
            <Text style={styles.dateText}>Le {item.date}</Text>
            {item.comment && (
              <Text style={styles.commentText}>Commentaire : {item.comment}</Text>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
      
      <Button 
        mode="contained" 
        style={styles.button}
        onPress={() => console.log('Voir toutes les notes')}
      >
        Voir toutes mes notes
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3F51B5',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  listContent: {
    paddingBottom: 15,
  },
  gradeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3F51B5',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388E3C', // Vert pour les notes
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#3F51B5',
  },
});