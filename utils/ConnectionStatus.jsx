import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { checkNetworkConnectivity } from '../utils/networkUtils';

/**
 * Composant qui vérifie la connectivité réseau et affiche un message si elle est indisponible
 */
export default function ConnectionStatus({ onStatusChange }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  
  // Vérifier la connexion au chargement et périodiquement
  useEffect(() => {
    // Fonction pour vérifier la connexion
    const checkConnection = async () => {
      const hasConnection = await checkNetworkConnectivity();
      setIsConnected(hasConnection);
      setIsVisible(!hasConnection);
      
      // Notifier le parent du changement d'état si nécessaire
      if (onStatusChange) {
        onStatusChange(hasConnection);
      }
    };
    
    // Vérifier immédiatement la connexion
    checkConnection();
    
    // Puis vérifier toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    
    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(interval);
  }, [onStatusChange]);
  
  // Fonction pour réessayer manuellement
  const handleRetry = async () => {
    const hasConnection = await checkNetworkConnectivity();
    setIsConnected(hasConnection);
    setIsVisible(!hasConnection);
    
    if (onStatusChange) {
      onStatusChange(hasConnection);
    }
  };
  
  // Ne rien afficher si tout va bien ou si l'alerte est cachée
  if (isConnected || !isVisible) {
    return null;
  }
  
  // Afficher une bannière d'alerte si la connexion est perdue
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        ⚠️ Connexion internet indisponible. L'application pourrait ne pas fonctionner correctement.
      </Text>
      <Pressable style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryText}>Réessayer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7', // Jaune clair
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B', // Orange
  },
  message: {
    color: '#92400E', // Texte brun
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  retryButton: {
    backgroundColor: '#F59E0B', // Orange
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
