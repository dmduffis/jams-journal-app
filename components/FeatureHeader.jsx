import { View, Text, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const FeatureHeader = () => {
  const [currentIssue, setCurrentIssue] = useState(null);
  const navigation = useNavigation();

  const getCurrentIssue = async () => {
    try {
      const response = await fetch(
        "https://jams-journal-backend.up.railway.app/journals"
      );
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        // Sort by issueNumber descending to get the latest issue
        const sortedJournals = [...data].sort((a, b) => b.issueNumber - a.issueNumber);
        setCurrentIssue(sortedJournals[0]);
      }
    } catch (error) {
      console.error("Error fetching current issue:", error);
    }
  };

  useEffect(() => {
    getCurrentIssue();
  }, []);

  if (!currentIssue) return null;

  const item = currentIssue

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate ("Issue Details", {item})}>
        <Image style={styles.featuredImg} source={{uri: item.coverPhoto || 'https://via.placeholder.com/119x185'}}/>
        </TouchableOpacity>
      <View style={styles.txtContainer}>
        <View style={styles.current}><Text style={styles.txtCurrent}>Current Issue</Text></View>
        <Text style={styles.txtIssueTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.txtIssueNumber}>{item.subtitle}</Text>}
      
      <View style={styles.actionOptions}>
        <TouchableOpacity style={styles.readBtn} onPress={() => navigation.navigate ("Issue Details", {item})}>
          <Text style={styles.txtReadNow}>View Issue</Text>
          <Text style={{marginLeft: 5, marginTop: 3,}}><Ionicons name='arrow-forward-sharp' size={15} color='#357db5'/></Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Text style={{marginLeft: 20, marginTop: 15}}><Ionicons name='bookmark-outline' size={20} color='#357db5'/></Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}}>
          <Text style={{marginLeft: 8, marginTop: 15}}><Ionicons name='share-outline' size={20} color='#357db5'/></Text>
        </TouchableOpacity>
        
        </View>
      </View>
    </View>
  )
}

export default FeatureHeader

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        alignSelf: 'center',
        height: 'auto',
        marginBottom: 5,
        marginLeft: 20,
        marginRight: 20,
        borderBottomLeftRadius: 30,
        padding: 20,
        backgroundColor: '#fff',
    },
    featuredImg: {
        width: 119,
        height: 185,
    },
    txtContainer: {
        display: 'flex',
        width: 210,
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 15,
    },
    txtCurrent: {
        fontFamily: 'sans_bold',
        textTransform: 'uppercase',
        fontSize: 13,
        color: '#357db5',

    },
    txtIssueNumber: {
        fontFamily: 'sans_medium',
        marginTop: 10,
        fontSize: 14,
        color: '#868689',
    },
    txtIssueTitle: {
        fontFamily: 'sans_semibold',
        fontSize: 20,
        color: 'black',
    },
    actionOptions: { 
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',

    },
    txtReadNow: {
        fontFamily: 'sans_semibold',
        fontSize: 15,
        color: 'black',
        textAlign: 'center',
        color: '#357db5',
    },
    readBtn: {
      padding: 8,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignContent: 'center',
      marginTop: 15,
      width: 125,
      borderRadius: 20,
      borderColor: '#357db5',
      borderWidth: 1,
      borderStyle: 'solid',
    }
})