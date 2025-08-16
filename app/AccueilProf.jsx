

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, ScrollView, KeyboardAvoidingView, Platform, BackHandler, Alert } from 'react-native';
import { Button, Card, FAB } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../supabaseClient';
export default function AccueilProf() {
  const router = useRouter();
  const [prof, setProf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classesTabs, setClassesTabs] = useState([]); // [{classe: '6A', subject: 'Math', eleves: [...], notes: {...}}]
  const [activeTab, setActiveTab] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEleve, setCurrentEleve] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [noteComment, setNoteComment] = useState('');
  const [noteEvaluation, setNoteEvaluation] = useState('');
  const [noteCoefficient, setNoteCoefficient] = useState('1');
  const [addingNote, setAddingNote] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // Mode évaluation de classe
  const [classEvalMode, setClassEvalMode] = useState(false);
  const [classEvalName, setClassEvalName] = useState('');
  const [classEvalCoeff, setClassEvalCoeff] = useState('1');
  const [classNotes, setClassNotes] = useState({});
  const [savingClassEval, setSavingClassEval] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Mode absences
  const [absenceMode, setAbsenceMode] = useState(false);
  const [currentEleveAbsence, setCurrentEleveAbsence] = useState(null);
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [absenceReason, setAbsenceReason] = useState('');
  const [markingAbsence, setMarkingAbsence] = useState(false);

  // Mode visualisation des évaluations
  const [evaluationsMode, setEvaluationsMode] = useState(false);
  const [allEvaluations, setAllEvaluations] = useState([]);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);

  // Génère automatiquement un commentaire selon la note
  const getAutomaticComment = (note) => {
    const noteNum = parseFloat(note);
    if (isNaN(noteNum)) return '';
    
    if (noteNum >= 18) return 'Excellent travail, félicitations !';
    if (noteNum >= 16) return 'Très bon travail';
    if (noteNum >= 14) return 'Bon travail';
    if (noteNum >= 12) return 'Travail satisfaisant';
    if (noteNum >= 10) return 'Travail moyen, peut mieux faire';
    if (noteNum >= 8) return 'Insuffisant, des efforts sont à fournir';
    if (noteNum >= 6) return 'Travail faible, il faut réagir';
    return 'Travail très insuffisant, alerte !';
  };

  // Charger prof et ses classes, et élèves de toutes ses classes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      // Prof info (on récupère aussi classe et subject)
      const { data: profData } = await supabase
        .from('profs')
        .select('nom, email, id, classe, subject')
        .eq('user_id', user.id)
        .single();
      
      console.log('PROF DATA:', profData);
      
      setProf(profData);
      if (!profData?.classe || !profData?.subject) {
        console.log('MANQUE CLASSE OU SUBJECT:', { classe: profData?.classe, subject: profData?.subject });
        setClassesTabs([]);
        setLoading(false);
        return;
      }

      // Gérer le cas où classe peut être un string, un array, ou une string avec virgules
      let classes;
      if (Array.isArray(profData.classe)) {
        classes = profData.classe;
      } else if (typeof profData.classe === 'string' && profData.classe.includes(',')) {
        classes = profData.classe.split(',').map(c => c.trim());
      } else {
        classes = [profData.classe];
      }
      
      console.log('CLASSES DETECTEES:', classes);
      
      // Pour chaque classe, récupérer les élèves et leurs notes
      let tabsData = [];
      for (const classe of classes) {
        console.log('RECHERCHE ELEVES POUR CLASSE:', classe);
        // Élèves de cette classe
        const { data: elevesData } = await supabase
          .from('students')
          .select('id, nom, classe')
          .eq('classe', classe)
          .order('nom');
          
        console.log('ELEVES TROUVES:', elevesData);
        // Charger la dernière note de la matière du prof pour chaque élève de cette classe
        let notesObj = {};
        for (const el of elevesData || []) {
          const { data: lastNote } = await supabase
            .from('notes')
            .select('value, comment, subject, evaluation, coefficient')
            .eq('student_id', el.id)
            .eq('subject', profData.subject)
            .order('date', { ascending: false })
            .limit(1)
            .single();
          notesObj[el.id] = lastNote;
        }
        
        // Ajouter cet onglet classe
        tabsData.push({
          classe: classe,
          subject: profData.subject,
          eleves: elevesData || [],
          notes: notesObj
        });
      }
      
      console.log('TABS DATA FINAL:', tabsData);
      setClassesTabs(tabsData);
      setLoading(false);
    };
    fetchData();
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

  // Gérer l'affichage du clavier
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Ouvre le modal d'ajout de note
  const openModal = (eleve) => {
    setCurrentEleve(eleve);
    setNoteValue('');
    setNoteComment('');
    setNoteEvaluation('');
    setNoteCoefficient('1');
    setModalVisible(true);
  };

  // Ouvre le mode évaluation de classe
  const openClassEvalMode = () => {
    setClassEvalMode(true);
    setClassEvalName('');
    setClassEvalCoeff('1');
    setClassNotes({});
    setModalVisible(true);
  };

  // Ouvre le modal d'absence
  const openAbsenceModal = (eleve) => {
    setCurrentEleveAbsence(eleve);
    setAbsenceMode(true);
    setAbsenceDate(new Date().toISOString().split('T')[0]);
    setAbsenceReason('');
    setModalVisible(true);
  };

  // Fermer le modal d'absence
  const closeAbsenceModal = () => {
    setModalVisible(false);
    setAbsenceMode(false);
    setCurrentEleveAbsence(null);
    setAbsenceReason('');
  };

  // Ouvre le mode visualisation des évaluations
  const openEvaluationsMode = async () => {
    setEvaluationsMode(true);
    setLoadingEvaluations(true);
    setModalVisible(true);

    try {
      const currentClass = classesTabs[activeTab];
      if (!currentClass) return;

      // Récupérer toutes les évaluations pour cette classe/matière
      const { data: evaluationsData, error: evalError } = await supabase
        .from('notes')
        .select('evaluation, coefficient, date, student_id, value, comment')
        .eq('subject', currentClass.subject)
        .in('student_id', currentClass.eleves.map(e => e.id))
        .order('date', { ascending: false });

      if (evalError) {
        console.log('Erreur récupération évaluations:', evalError);
        setAllEvaluations([]);
        return;
      }

      // Grouper par évaluation
      const evaluationsGrouped = {};
      evaluationsData?.forEach(note => {
        const evalKey = `${note.evaluation}_${note.date}_${note.coefficient}`;
        if (!evaluationsGrouped[evalKey]) {
          evaluationsGrouped[evalKey] = {
            evaluation: note.evaluation,
            date: note.date,
            coefficient: note.coefficient,
            notes: []
          };
        }
        
        // Trouver l'élève correspondant
        const eleve = currentClass.eleves.find(e => e.id === note.student_id);
        if (eleve) {
          evaluationsGrouped[evalKey].notes.push({
            student_name: eleve.nom,
            value: note.value,
            comment: note.comment
          });
        }
      });

      setAllEvaluations(Object.values(evaluationsGrouped));
    } catch (err) {
      console.log('Erreur:', err);
      setAllEvaluations([]);
    }

    setLoadingEvaluations(false);
  };

  // Validation des notes individuelles (0-20)
  const handleNoteValueChange = (value) => {
    // Permet la suppression complète
    if (value === '') {
      setNoteValue('');
      return;
    }
    
    // Vérifie que c'est un nombre valide
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return; // Ignore les valeurs non numériques
    }
    
    // Limite à 20 maximum
    if (numValue > 20) {
      setNoteValue('20');
      return;
    }
    
    // Limite à 0 minimum  
    if (numValue < 0) {
      setNoteValue('0');
      return;
    }
    
    // Valeur valide
    setNoteValue(value);
  };

  // Met à jour une note dans l'évaluation de classe avec validation
  const updateClassNote = (eleveId, noteValue) => {
    // Validation : vide, nombre valide, entre 0 et 20
    if (noteValue === '') {
      // Permet la suppression de la note
      setClassNotes(prev => ({
        ...prev,
        [eleveId]: ''
      }));
      return;
    }
    
    // Vérifie que c'est un nombre valide
    const numValue = parseFloat(noteValue);
    if (isNaN(numValue)) {
      return; // Ignore les valeurs non numériques
    }
    
    // Limite à 20 maximum
    if (numValue > 20) {
      setClassNotes(prev => ({
        ...prev,
        [eleveId]: '20'
      }));
      return;
    }
    
    // Limite à 0 minimum
    if (numValue < 0) {
      setClassNotes(prev => ({
        ...prev,
        [eleveId]: '0'
      }));
      return;
    }
    
    // Valeur valide
    setClassNotes(prev => ({
      ...prev,
      [eleveId]: noteValue
    }));
  };

  // Ajoute ou remplace la note pour la matière du prof
  const handleAddNote = async () => {
    if (!noteValue || isNaN(noteValue) || noteValue < 0 || noteValue > 20) return;
    if (!noteEvaluation.trim()) {
      setFeedback("Veuillez renseigner le type d'évaluation");
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    if (!noteCoefficient || isNaN(noteCoefficient) || noteCoefficient <= 0) {
      setFeedback("Le coefficient doit être un nombre positif");
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    
    setAddingNote(true);
    // Vérifier s'il existe déjà une note pour cet élève et cette matière
    const { data: existingNote } = await supabase
      .from('notes')
      .select('id')
      .eq('student_id', currentEleve.id)
      .eq('subject', prof?.subject)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    let error = null;
    if (existingNote && existingNote.id) {
      // Mettre à jour la note existante
      const { error: updateError } = await supabase
        .from('notes')
        .update({
          value: Number(noteValue),
          comment: getAutomaticComment(noteValue),
          evaluation: noteEvaluation,
          coefficient: Number(noteCoefficient),
          date: new Date().toISOString(),
          subject: prof.subject
        })
        .eq('id', existingNote.id);
      error = updateError;
    } else {
      // Insérer une nouvelle note
      const { error: insertError } = await supabase
        .from('notes')
        .insert({
          value: Number(noteValue),
          comment: getAutomaticComment(noteValue),
          evaluation: noteEvaluation,
          coefficient: Number(noteCoefficient),
          student_id: currentEleve.id,
          date: new Date().toISOString(),
          subject: prof.subject
        });
      error = insertError;
    }
    if (error) {
      console.log('SUPABASE NOTE ERROR:', error);
    }
    setAddingNote(false);
    setModalVisible(false);
    if (!error) {
      setFeedback('Note enregistrée !');
      setTimeout(() => setFeedback(''), 2000);
      // Refresh les données de la classe active
      setLoading(true);
      const currentClass = classesTabs[activeTab].classe;
      
      // Re-fetch élèves de cette classe
      const { data: elevesData } = await supabase
        .from('students')
        .select('id, nom, classe')
        .eq('classe', currentClass)
        .order('nom');
      
      // Re-fetch notes pour cette classe
      let notesObj = {};
      for (const el of elevesData || []) {
        const { data: lastNote } = await supabase
          .from('notes')
          .select('value, comment, subject, evaluation, coefficient')
          .eq('student_id', el.id)
          .eq('subject', prof.subject)
          .order('date', { ascending: false })
          .limit(1)
          .single();
        notesObj[el.id] = lastNote;
      }
      
      // Mettre à jour seulement la classe active
      const updatedTabs = [...classesTabs];
      updatedTabs[activeTab] = {
        ...updatedTabs[activeTab],
        eleves: elevesData || [],
        notes: notesObj
      };
      setClassesTabs(updatedTabs);
      setLoading(false);
    } else {
      setFeedback("Erreur lors de l'enregistrement");
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  // Sauvegarde l'évaluation de classe
  const handleSaveClassEval = async () => {
    if (!classEvalName.trim()) {
      setFeedback("Veuillez renseigner le nom de l'évaluation");
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    if (!classEvalCoeff || isNaN(classEvalCoeff) || classEvalCoeff <= 0) {
      setFeedback("Le coefficient doit être un nombre positif");
      setTimeout(() => setFeedback(''), 2000);
      return;
    }

    const validNotes = Object.entries(classNotes).filter(([_, note]) => 
      note && !isNaN(note) && note >= 0 && note <= 20
    );

    if (validNotes.length === 0) {
      setFeedback("Veuillez saisir au moins une note valide");
      setTimeout(() => setFeedback(''), 2000);
      return;
    }

    setSavingClassEval(true);

    try {
      // Insérer toutes les notes en une fois
      const notesToInsert = validNotes.map(([eleveId, note]) => ({
        value: Number(note),
        comment: getAutomaticComment(note),
        evaluation: classEvalName,
        coefficient: Number(classEvalCoeff),
        student_id: eleveId,
        date: new Date().toISOString(),
        subject: prof.subject
      }));

      const { error } = await supabase
        .from('notes')
        .insert(notesToInsert);

      if (error) {
        console.log('SUPABASE CLASS EVAL ERROR:', error);
        setFeedback("Erreur lors de l'enregistrement");
      } else {
        setFeedback(`${validNotes.length} notes enregistrées !`);
        setModalVisible(false);
        setClassEvalMode(false);
        
        // Refresh les données
        setLoading(true);
        const currentClass = classesTabs[activeTab].classe;
        
        const { data: elevesData } = await supabase
          .from('students')
          .select('id, nom, classe')
          .eq('classe', currentClass)
          .order('nom');
        
        let notesObj = {};
        for (const el of elevesData || []) {
          const { data: lastNote } = await supabase
            .from('notes')
            .select('value, comment, subject, evaluation, coefficient')
            .eq('student_id', el.id)
            .eq('subject', prof.subject)
            .order('date', { ascending: false })
            .limit(1)
            .single();
          notesObj[el.id] = lastNote;
        }
        
        const updatedTabs = [...classesTabs];
        updatedTabs[activeTab] = {
          ...updatedTabs[activeTab],
          eleves: elevesData || [],
          notes: notesObj
        };
        setClassesTabs(updatedTabs);
        setLoading(false);
      }
    } catch (err) {
      console.log('Erreur:', err);
      setFeedback("Erreur lors de l'enregistrement");
    }

    setSavingClassEval(false);
    setTimeout(() => setFeedback(''), 3000);
  };

  // Marquer une absence
  const handleMarkAbsence = async () => {
    if (!absenceReason.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une raison pour cette absence.');
      return;
    }

    setMarkingAbsence(true);

    try {
      // Vérifier si une absence existe déjà pour cette date et cet élève
      const { data: existingAbsence } = await supabase
        .from('absences')
        .select('id')
        .eq('student_id', currentEleveAbsence.id)
        .eq('date', absenceDate)
        .eq('subject', prof.subject)
        .single();

      if (existingAbsence) {
        Alert.alert('Information', 'Absence déjà enregistrée pour cette date.');
      } else {
        // Insérer une nouvelle absence avec le motif
        const { error } = await supabase
          .from('absences')
          .insert({
            student_id: currentEleveAbsence.id,
            date: absenceDate,
            subject: prof.subject,
            prof_id: prof.id,
            justified: true, // Marquée comme justifiée car le prof fournit une raison
            reason: absenceReason.trim()
          });

        if (error) {
          console.log('SUPABASE ABSENCE ERROR:', error);
          Alert.alert('Erreur', 'Impossible d\'enregistrer l\'absence. Réessayez plus tard.');
        } else {
          Alert.alert('Succès', `Absence enregistrée pour ${currentEleveAbsence.nom}.`);
          closeAbsenceModal();
        }
      }
    } catch (err) {
      console.log('Erreur:', err);
      Alert.alert('Erreur', 'Une erreur inattendue s\'est produite.');
    }

    setMarkingAbsence(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header moderne thème professeur */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🏫</Text>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Espace Professeur</Text>
              <Text style={styles.headerSubtitle}>
                {prof ? `Bienvenue ${prof.nom}` : 'Chargement...'}
              </Text>
            </View>
          </View>
          
          {/* Feedback visuel intégré */}
          {feedback ? (
            <View style={styles.headerFeedback}>
              <Text style={styles.feedbackText}>✅ {feedback}</Text>
            </View>
          ) : null}
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Onglets pour les classes - Design moderne */}
          {!loading && classesTabs.length > 0 && (
            <View style={styles.tabsContainer}>
              <Text style={styles.sectionTitle}>Mes Classes</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScrollContainer}
              >
                {classesTabs.map((tab, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.modernTab, activeTab === index && styles.modernActiveTab]}
                    onPress={() => setActiveTab(index)}
                  >
                    <Text style={[styles.modernTabText, activeTab === index && styles.modernActiveTabText]}>
                      📚 Classe {tab.classe}
                    </Text>
                    <Text style={[styles.modernTabSubtext, activeTab === index && styles.modernActiveTabSubtext]}>
                      {tab.eleves?.length || 0} élèves
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Chargement */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF9800" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : null}

          {/* Liste des élèves - Design moderne avec Cards */}
          {!loading && classesTabs.length > 0 && classesTabs[activeTab] && (
            <View style={styles.studentsSection}>
              <Card style={styles.classInfoCard}>
                <Card.Content>
                  <View style={styles.classInfoHeader}>
                    <Text style={styles.classTitle}>
                      📚 Classe {classesTabs[activeTab].classe}
                    </Text>
                    <Text style={styles.subjectTitle}>
                      📖 {classesTabs[activeTab].subject}
                    </Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained"
                      icon="clipboard-edit"
                      style={styles.evaluationButton}
                      buttonColor="#FF9800"
                      onPress={openClassEvalMode}
                    >
                      Nouvelle Évaluation
                    </Button>
                    <Button
                      mode="contained"
                      icon="clipboard-list"
                      style={styles.evaluationButton}
                      buttonColor="#4CAF50"
                      onPress={openEvaluationsMode}
                    >
                      Liste des Notes
                    </Button>
                  </View>
                </Card.Content>
              </Card>
              
              <View style={styles.studentsHeader}>
                <Text style={styles.studentsTitle}>👥 Élèves ({classesTabs[activeTab].eleves?.length || 0})</Text>
              </View>
              
              {classesTabs[activeTab].eleves?.map((item) => (
                <Card key={item.id} style={styles.studentCard}>
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
              ))}
            </View>
          )}
        </ScrollView>

      {/* Modal ajout note */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (absenceMode) {
            closeAbsenceModal();
          } else {
            setModalVisible(false);
            setClassEvalMode(false);
            setEvaluationsMode(false);
          }
        }}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, (classEvalMode || evaluationsMode) && styles.modalContentLarge]}>
              
              {classEvalMode ? (
                // Mode évaluation de classe avec scroll amélioré
                <>
                  <Text style={styles.modalTitle}>
                    Évaluation de classe - {classesTabs[activeTab]?.classe}
                  </Text>
                  
                <TextInput
                  style={styles.input}
                  placeholder="Nom de l'évaluation"
                  value={classEvalName}
                  onChangeText={setClassEvalName}
                  maxLength={50}
                />
                
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Coefficient"
                    keyboardType="numeric"
                    value={classEvalCoeff}
                    onChangeText={setClassEvalCoeff}
                    maxLength={3}
                  />
                </View>                  <Text style={styles.notesLabel}>Notes des élèves :</Text>
                  <Text style={styles.noteHelperText}>
                    💡 Saisissez les notes (0-20) - validation automatique
                  </Text>
                  
                  {/* Bouton pour fermer le clavier */}
                  {keyboardVisible && (
                    <TouchableOpacity style={styles.dismissKeyboardBtn} onPress={() => Keyboard.dismiss()}>
                      <Text style={styles.dismissKeyboardText}>✓ Terminé</Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* ScrollView au lieu de FlatList pour une meilleure gestion du clavier */}
                  <ScrollView
                    style={styles.classNotesList}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContentContainer}
                  >
                    {(classesTabs[activeTab]?.eleves || []).map((item) => (
                      <View key={item.id} style={styles.classEleveCard}>
                        <View style={styles.eleveHeaderRow}>
                          <View style={styles.eleveNameContainer}>
                            <Text style={styles.eleveNameInModal}>{item.nom}</Text>
                          </View>
                          <TextInput
                            style={styles.noteInput}
                            placeholder="Note /20"
                            keyboardType="numeric"
                            value={classNotes[item.id] || ''}
                            onChangeText={(value) => updateClassNote(item.id, value)}
                            maxLength={5}
                            returnKeyType="next"
                            blurOnSubmit={false}
                          />
                        </View>
                        {classNotes[item.id] && (
                          <Text style={styles.autoComment}>
                            💬 {getAutomaticComment(classNotes[item.id])}
                          </Text>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity 
                    style={styles.modalBtn} 
                    onPress={handleSaveClassEval} 
                    disabled={savingClassEval}
                  >
                    <Text style={styles.modalBtnText}>
                      {savingClassEval ? 'Enregistrement...' : 'Enregistrer tout'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalBtn, { backgroundColor: '#aaa' }]} 
                    onPress={() => {
                      setModalVisible(false);
                      setClassEvalMode(false);
                    }}
                    disabled={savingClassEval}
                  >
                    <Text style={styles.modalBtnText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
                
                {savingClassEval && <ActivityIndicator size="small" color="#3F51B5" style={{ marginTop: 10 }} />}
              </>
            ) : evaluationsMode ? (
              // Mode visualisation des évaluations
              <>
                <Text style={styles.modalTitle}>
                  📊 Évaluations - {classesTabs[activeTab]?.classe}
                </Text>
                <Text style={styles.modalSubtitle}>
                  📖 {classesTabs[activeTab]?.subject}
                </Text>
                
                {loadingEvaluations ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Chargement des évaluations...</Text>
                  </View>
                ) : (
                  <ScrollView style={styles.evaluationsList} showsVerticalScrollIndicator={true}>
                    {allEvaluations.length > 0 ? (
                      allEvaluations.map((evaluation, index) => (
                        <View key={index} style={styles.evaluationCard}>
                          <View style={styles.evaluationHeader}>
                            <Text style={styles.evaluationName}>
                              📝 {evaluation.evaluation}
                            </Text>
                            <Text style={styles.evaluationDate}>
                              📅 {new Date(evaluation.date).toLocaleDateString('fr-FR')}
                            </Text>
                            <Text style={styles.evaluationCoeff}>
                              ⚖️ Coeff: {evaluation.coefficient}
                            </Text>
                          </View>
                          
                          <View style={styles.notesContainer}>
                            <Text style={styles.notesTitle}>Notes des élèves :</Text>
                            {evaluation.notes.map((note, noteIndex) => (
                              <View key={noteIndex} style={styles.studentNoteRow}>
                                <Text style={styles.studentNameInEval}>
                                  👤 {note.student_name}
                                </Text>
                                <Text style={styles.studentNoteValue}>
                                  {note.value}/20
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.noEvaluationsContainer}>
                        <Text style={styles.noEvaluationsText}>
                          📝 Aucune évaluation trouvée
                        </Text>
                        <Text style={styles.noEvaluationsSubtext}>
                          Créez votre première évaluation avec le bouton "Évaluation Classe"
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                )}
                
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setEvaluationsMode(false);
                  }}
                >
                  <Text style={styles.closeModalBtnText}>Fermer</Text>
                </TouchableOpacity>
              </>
            ) : absenceMode ? (
              // Mode absence - identique à AccueilEleve
              <>
                <Text style={styles.modalTitle}>Marquer une absence</Text>
                
                {currentEleveAbsence && (
                  <View style={styles.absenceInfo}>
                    <Text style={styles.absenceInfoText}>
                      � Date: {new Date(absenceDate).toLocaleDateString('fr-FR')}
                    </Text>
                    <Text style={styles.absenceInfoText}>
                      � Élève: {currentEleveAbsence.nom}
                    </Text>
                    <Text style={styles.absenceInfoText}>
                      📚 Matière: {prof?.subject}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.inputLabel}>Raison de l'absence :</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Raison de l'absence"
                  value={absenceReason}
                  onChangeText={setAbsenceReason}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeAbsenceModal}
                    disabled={markingAbsence}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleMarkAbsence}
                    disabled={markingAbsence}
                  >
                    <Text style={styles.submitButtonText}>
                      {markingAbsence ? 'Enregistrement...' : 'Marquer absent'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {markingAbsence && (
                  <ActivityIndicator size="small" color="#FF5722" style={{ marginTop: 10 }} />
                )}
              </>
            ) : (
              // Mode note individuelle
              <>
                <Text style={styles.modalTitle}>Ajouter une note à {currentEleve?.nom}</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Type d'évaluation"
                  value={noteEvaluation}
                  onChangeText={setNoteEvaluation}
                  maxLength={50}
                />
                
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Note"
                    keyboardType="numeric"
                    value={noteValue}
                    onChangeText={handleNoteValueChange}
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Coefficient"
                    keyboardType="numeric"
                    value={noteCoefficient}
                    onChangeText={setNoteCoefficient}
                    maxLength={3}
                  />
                </View>
                
                <Text style={styles.noteHelperText}>
                  💡 Note automatiquement limitée entre 0 et 20
                </Text>
                
                {noteValue && (
                  <View style={styles.commentPreview}>
                    <Text style={styles.commentPreviewLabel}>Commentaire automatique :</Text>
                    <Text style={styles.commentPreviewText}>
                      💬 {getAutomaticComment(noteValue)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.modalBtn} onPress={handleAddNote} disabled={addingNote}>
                    <Text style={styles.modalBtnText}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalBtn, { backgroundColor: '#aaa' }]} 
                    onPress={() => setModalVisible(false)} 
                    disabled={addingNote}
                  >
                    <Text style={styles.modalBtnText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
                
                {addingNote && <ActivityIndicator size="small" color="#3F51B5" style={{ marginTop: 10 }} />}
              </>
            )}
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
    backgroundColor: '#F5F5F5',
  },
  
  // Header moderne
  header: {
    backgroundColor: '#FF9800',
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
  
  headerFeedback: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  
  feedbackText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Onglets modernes
  tabsContainer: {
    marginVertical: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  
  tabsScrollContainer: {
    paddingRight: 16,
  },
  
  modernTab: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    minWidth: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  modernActiveTab: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
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
    marginTop: 2,
  },
  
  modernActiveTabSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
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
  },
  
  // Section des élèves
  studentsSection: {
    flex: 1,
    marginBottom: 20, // Espace en bas
  },
  
  classInfoCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
  },
  
  classInfoHeader: {
    marginBottom: 12,
  },
  
  classTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 4,
  },
  
  subjectTitle: {
    fontSize: 14,
    color: '#666',
  },
  
  evaluationButton: {
    borderRadius: 8,
  },

  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
  },

  halfButton: {
    flex: 1,
  },
  
  studentsHeader: {
    marginBottom: 12,
  },
  
  studentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Cards des élèves
  studentCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  
  studentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  
  studentNote: {
    fontSize: 14,
    color: '#666',
  },
  
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  actionButtonNote: {
    borderRadius: 6,
    minWidth: 80,
  },
  
  actionButtonAbsence: {
    borderRadius: 6,
    minWidth: 80,
  },
  
  // Styles des modales (conservés et adaptés)
  keyboardAvoidingView: {
    flex: 1,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: 320,
    alignItems: 'center',
  },
  
  modalContentLarge: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    margin: 15,
    maxHeight: '85%', // Réduit pour laisser plus d'espace au clavier
    width: '95%',
    alignSelf: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 12,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontFamily: 'Roboto',
    backgroundColor: '#F5F5F5',
    fontSize: 16,
  },
  
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  halfInput: {
    width: '48%',
  },
  
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
    gap: 10,
  },
  
  modalBtn: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
  },
  
  modalBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    fontSize: 16,
  },
  
  noteHelperText: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  
  notesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  
  classNotesList: {
    maxHeight: 280, // Réduit légèrement pour laisser plus d'espace
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  
  scrollContentContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  
  classEleveCard: {
    backgroundColor: '#FFF3E0',
    marginVertical: 6,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  
  eleveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
    width: '100%',
  },
  
  eleveNameContainer: {
    flex: 1,
    paddingRight: 10,
    minWidth: 0,
  },
  
  eleveNameInModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    textAlign: 'left',
    flexShrink: 1,
    minWidth: 0,
  },
  
  autoComment: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
    paddingLeft: 5,
  },
  
  noteInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF9800',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    flexShrink: 0,
    fontWeight: 'bold',
  },
  
  commentPreview: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  
  commentPreviewLabel: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  
  commentPreviewText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  
  dismissKeyboardBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: 5,
  },
  
  dismissKeyboardText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },

  // Styles pour le mode visualisation des évaluations
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  evaluationsList: {
    maxHeight: 400,
    width: '100%',
  },

  evaluationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },

  evaluationHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  evaluationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  evaluationDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },

  evaluationCoeff: {
    fontSize: 14,
    color: '#666',
  },

  notesContainer: {
    marginTop: 8,
  },

  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },

  studentNoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginBottom: 4,
  },

  studentNameInEval: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },

  studentNoteValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  noEvaluationsContainer: {
    padding: 20,
    alignItems: 'center',
  },

  noEvaluationsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },

  noEvaluationsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Bouton fermer spécifique pour le modal des évaluations
  closeModalBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    width: '100%',
    marginTop: 15,
  },

  closeModalBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Styles spécifiques pour le modal d'absence (identique à AccueilEleve)
  absenceInfo: {
    backgroundColor: '#FFF3E0', // Orange clair pour le thème professeur
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  absenceInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#FF9800', // Orange pour le thème professeur
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#f0f0f0',
  },

  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },

  submitButton: {
    backgroundColor: '#FF5722', // Rouge pour l'action d'absence
  },

  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

