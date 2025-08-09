import { StyleSheet, View, Dimensions } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  
  const userTypes = [
    {
      title: 'Parent',
      subtitle: 'Suivez la scolarité de vos enfants',
      icon: '👨‍👩‍👧‍👦',
      route: '/(LoginScreen)/ParentScreen',
      color: '#4CAF50'
    },
    {
      title: 'Élève',
      subtitle: 'Consultez vos notes et absences',
      icon: '🎓',
      route: '/(LoginScreen)/StudentScreen',
      color: '#2196F3'
    },
    {
      title: 'Professeur',
      subtitle: 'Gérez vos classes et évaluations',
      icon: '🏫',
      route: '/(LoginScreen)/ProfScreen',
      color: '#FF9800'
    }
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 SuiviScol</Text>
        <Text style={styles.subtitle}>Plateforme de suivi scolaire</Text>
      </View>
      
      <View style={styles.cardContainer}>
        <Text style={styles.selectionText}>Choisissez votre profil</Text>
        
        {userTypes.map((type, index) => (
          <Card key={index} style={[styles.userCard, { borderLeftColor: type.color }]}>
            <Card.Content>
              <Button 
                mode="text" 
                onPress={() => router.push(type.route)}
                style={styles.cardButton}
                contentStyle={styles.cardButtonContent}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.userIcon}>{type.icon}</Text>
                  <View style={styles.textContent}>
                    <Text style={[styles.userTitle, { color: type.color }]}>{type.title}</Text>
                    <Text style={styles.userSubtitle}>{type.subtitle}</Text>
                  </View>
                  <Text style={[styles.arrow, { color: type.color }]}>→</Text>
                </View>
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#3F51B5',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    justifyContent: 'center',
  },
  selectionText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
    fontWeight: '600',
  },
  userCard: {
    marginVertical: 8,
    borderRadius: 15,
    elevation: 4,
    backgroundColor: 'white',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  cardButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  userIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  textContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  userTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '400',
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#bdc3c7',
    fontWeight: '300',
  },
});